<?php

namespace App\Modules\Order\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Requests\UpdateOrderStatusRequest;
use App\Modules\Order\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * PRD 17 "Orders — Admin": Kelola Pesanan.
 * Semua route di sini dijaga middleware 'role:admin'.
 */
class AdminOrderController extends Controller
{
    public function __construct(
        protected OrderService $orders
    ) {}

    // GET /admin/orders?status=menunggu
    public function index(Request $request): Response
    {
        // tryFrom → null jika ?status tidak valid, sehingga filter diabaikan (tidak error).
        $status = OrderStatus::tryFrom((string) $request->query('status'));

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $this->orders->paginateAll($status),
            'filters' => ['status' => $status?->value],
            'statuses' => $this->statusOptions(OrderStatus::cases()),
        ]);
    }

    // GET /admin/orders/{order}
    public function show(Order $order): Response
    {
        return Inertia::render('Admin/Orders/Show', [
            'order' => $this->orders->loadDetail($order),
            // Tombol yang perlu ditampilkan FE, mis. dari Menunggu: Diproses / Ditolak / Dibatalkan.
            'allowedStatuses' => $this->statusOptions($order->status->allowedTransitions()),
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
