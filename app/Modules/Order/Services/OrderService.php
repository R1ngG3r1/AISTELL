<?php

namespace App\Modules\Order\Services;

use App\Models\User;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

/**
 * Business logic pesanan (PRD 7 "Alur Pemesanan").
 * Semua perubahan status WAJIB lewat class ini agar aturan transisi selalu dicek.
 */
class OrderService
{
    /** Relasi yang hampir selalu ditampilkan bersama pesanan. */
    private const WITH = [
        'service:id,name,price',
        'user:id,name,email,phone',
    ];

    /**
     * Langkah 1–3: user mengirim pesanan.
     * Dibuat lewat relasi $user->orders() → user_id otomatis = user yang login.
     */
    public function createFor(User $user, array $data): Order
    {
        return $user->orders()->create($data);
    }

    /**
     * Langkah 5–6: admin menerima / menolak / memperbarui status.
     *
     * @throws ValidationException jika transisi tidak diizinkan
     */
    public function changeStatus(Order $order, OrderStatus $next): Order
    {
        if (! $order->status->canTransitionTo($next)) {
            // ValidationException → di React muncul sebagai errors.status
            throw ValidationException::withMessages([
                'status' => "Status tidak dapat diubah dari {$order->status->label()} menjadi {$next->label()}.",
            ]);
        }

        $order->status = $next;
        $order->save();

        return $order;
    }

    public function cancel(Order $order): Order
    {
        return $this->changeStatus($order, OrderStatus::Dibatalkan);
    }

    /** "Pesanan Saya": hanya milik user tersebut, terbaru di atas. */
    public function paginateForUser(User $user, int $perPage = 10): LengthAwarePaginator
    {
        return $user->orders()
            ->with('service:id,name,price')
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    /** "Kelola Pesanan" admin: semua pesanan, bisa difilter berdasarkan status. */
    public function paginateAll(?OrderStatus $status = null, int $perPage = 15): LengthAwarePaginator
    {
        return Order::query()
            ->with(self::WITH) // eager loading: cegah N+1 query
            ->when($status, fn (Builder $q) => $q->where('status', $status))
            ->latest()
            ->paginate($perPage)
            ->withQueryString(); // agar ?status=... ikut di link halaman berikutnya
    }

    public function loadDetail(Order $order): Order
    {
        return $order->load(self::WITH);
    }

    /**
     * Ringkasan untuk dashboard: jumlah pesanan per status.
     * Contoh hasil: ['total' => 7, 'menunggu' => 2, 'diproses' => 1, ...]
     * $user = null → semua pesanan (admin), selain itu hanya milik user tersebut.
     *
     * @return array<string, int>
     */
    public function statusCounts(?User $user = null): array
    {
        $counts = Order::query()
            ->when($user, fn (Builder $q) => $q->whereBelongsTo($user))
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->toBase() // ambil angka mentah tanpa diubah menjadi model
            ->pluck('total', 'status');

        // Pastikan semua status muncul, walaupun jumlahnya 0.
        $result = ['total' => (int) $counts->sum()];
        foreach (OrderStatus::cases() as $status) {
            $result[$status->value] = (int) ($counts[$status->value] ?? 0);
        }

        return $result;
    }

    /** @return Collection<int, Order> */
    public function latest(?User $user = null, int $limit = 5): Collection
    {
        return Order::query()
            ->with(self::WITH)
            ->when($user, fn (Builder $q) => $q->whereBelongsTo($user))
            ->latest()
            ->limit($limit)
            ->get();
    }
}
