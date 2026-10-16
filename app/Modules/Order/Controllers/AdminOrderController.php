<?php

namespace App\Modules\Order\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Requests\OrderFilterRequest;
use App\Modules\Order\Requests\UpdateOrderStatusRequest;
use App\Modules\Order\Services\OrderService;
use App\Modules\Service\Models\Service;
use App\Modules\Staff\Services\StaffService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * PRD 17 "Orders - Admin": Kelola Pesanan.
 * Semua route di sini dijaga middleware 'role:admin'.
 */
class AdminOrderController extends Controller
{
    public function __construct(
        protected OrderService $orders,
        protected StaffService $staff,
    ) {}

    // GET /admin/orders?status=menunggu&q=budi&service=3&from=2026-10-01&to=2026-10-31&payment=lunas
    public function index(OrderFilterRequest $request): Response
    {
        return Inertia::render('Admin/Orders/Index', [
            // fn() → ikut diperbarui saat polling realtime di frontend
            'orders' => fn () => $this->orders->paginateAll($request->filters()),
            // Nilai yang tidak valid sudah dibuang, jadi kolom filter selalu cocok dengan hasilnya.
            'filters' => $request->forView(),
            'statuses' => $this->statusOptions(OrderStatus::cases()),
            'services' => Service::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    // GET /admin/orders/{order}
    public function show(Order $order): Response
    {
        return Inertia::render('Admin/Orders/Show', [
            'order' => fn () => $this->orders->loadDetail($order),
            // Tombol yang perlu ditampilkan FE, mis. dari Menunggu: Diproses / Ditolak / Dibatalkan.
            'allowedStatuses' => fn () => $this->statusOptions($order->status->allowedTransitions()),
            // Pilihan petugas + penanda bentrok jadwal untuk pesanan ini.
            'staffOptions' => fn () => $this->staff->optionsFor($order),
        ]);
    }

    // PUT /admin/orders/{order}/status   body: { status: "diproses" }
    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): RedirectResponse
    {
        $this->orders->changeStatus($order, $request->status());

        return back()->with('success', "Status pesanan diubah menjadi {$order->status->label()}.");
    }

    /**
     * Ubah daftar Enum menjadi format yang mudah dipakai di <select> / tombol React.
     *
     * @param  array<int, OrderStatus>  $statuses
     * @return array<int, array{value: string, label: string}>
     */
    private function statusOptions(array $statuses): array
    {
        return array_map(fn (OrderStatus $s) => ['value' => $s->value, 'label' => $s->label()], $statuses);
    }
}
