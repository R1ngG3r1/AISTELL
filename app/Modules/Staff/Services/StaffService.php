<?php

namespace App\Modules\Staff\Services;

use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Staff\Models\Staff;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

/**
 * Business logic petugas: CRUD, dan penugasan ke pesanan dengan pengecekan jadwal bentrok.
 * Penugasan WAJIB lewat assign() agar aturannya selalu dicek.
 */
class StaffService
{
    /** Default lama pengerjaan (menit) bila layanan tidak punya durasi. */
    private const DEFAULT_DURATION = 120;

    /** @return Collection<int, Staff> */
    public function all(): Collection
    {
        return Staff::query()
            ->withCount(['orders as upcoming_orders_count' => fn (Builder $q) => $q
                ->whereIn('status', OrderStatus::active())
                ->whereDate('date', '>=', today()->toDateString())])
            ->withCount('orders')
            ->orderByDesc('is_active')
            ->orderBy('name')
            ->get();
    }

    public function create(array $data): Staff
    {
        return Staff::create($data);
    }

    public function update(Staff $staff, array $data): Staff
    {
        $staff->update($data);

        return $staff;
    }

    /** false jika petugas pernah ditugaskan (riwayat harus utuh; nonaktifkan saja). */
    public function delete(Staff $staff): bool
    {
        if ($staff->orders()->exists()) {
            return false;
        }

        return (bool) $staff->delete();
    }

    /**
     * Tugaskan (atau lepas, jika $staff null) petugas pada pesanan.
     *
     * @throws ValidationException jika pesanan sudah berstatus akhir, petugas nonaktif, atau jadwalnya bentrok
     */
    public function assign(Order $order, ?Staff $staff): Order
    {
        if (! in_array($order->status, OrderStatus::active(), true)) {
            throw ValidationException::withMessages([
                'staff_id' => "Pesanan {$order->status->label()} tidak dapat diubah petugasnya.",
            ]);
        }

        if ($staff && $staff->id !== $order->staff_id) {
            if (! $staff->is_active) {
                throw ValidationException::withMessages(['staff_id' => "{$staff->name} sedang nonaktif."]);
            }

            if ($conflict = $this->conflictFor($staff, $order)) {
                throw ValidationException::withMessages(['staff_id' => $this->conflictMessage($staff, $conflict)]);
            }
        }

        $order->staff()->associate($staff);
        $order->save();

        return $order;
    }

    /**
     * Pesanan lain petugas yang jamnya beririsan dengan pesanan ini (null = tidak bentrok).
     * Hanya pesanan aktif (menunggu/diproses) yang dihitung.
     */
    public function conflictFor(Staff $staff, Order $order): ?Order
    {
        [$start, $end] = $this->window($order);

        return Order::query()
            ->where('staff_id', $staff->id)
            ->whereKeyNot($order->id)
            ->whereDate('date', $order->date->toDateString())
            ->whereIn('status', OrderStatus::active())
            ->with('service:id,name,duration_minutes')
            ->get()
            ->first(function (Order $other) use ($start, $end) {
                [$otherStart, $otherEnd] = $this->window($other);

                return $start < $otherEnd && $otherStart < $end;
            });
    }

    /**
     * Pilihan petugas di halaman pesanan admin. `busy` berisi alasan bentrok (atau null).
     * Petugas nonaktif hanya ikut jika sedang ditugaskan di pesanan ini.
     *
     * @return array<int, array{id: int, name: string, phone: string, type: string, is_active: bool, busy: ?string}>
     */
    public function optionsFor(Order $order): array
    {
        return Staff::query()
            ->where(fn (Builder $q) => $q->where('is_active', true)->orWhere('id', $order->staff_id))
            ->orderBy('name')
            ->get()
            ->map(fn (Staff $s) => [
                'id' => $s->id,
                'name' => $s->name,
                'phone' => $s->phone,
                'type' => $s->type->value,
                'is_active' => $s->is_active,
                'busy' => $s->id !== $order->staff_id && ($c = $this->conflictFor($s, $order))
                    ? $this->conflictMessage($s, $c)
                    : null,
            ])
            ->all();
    }

    /** @return array{0: int, 1: int} menit sejak 00:00: [mulai, selesai] */
    private function window(Order $order): array
    {
        [$h, $m] = array_map('intval', explode(':', $order->time));
        $start = $h * 60 + $m;

        return [$start, $start + ($order->service?->duration_minutes ?: self::DEFAULT_DURATION)];
    }

    private function conflictMessage(Staff $staff, Order $other): string
    {
        $time = substr($other->time, 0, 5);

        return "{$staff->name} sudah bertugas di pesanan #{$other->id} ({$other->service?->name}) pukul {$time} pada hari yang sama.";
    }
}
