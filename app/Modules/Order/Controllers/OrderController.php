<?php

namespace App\Modules\Order\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Address\Services\AddressService;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Requests\StoreOrderRequest;
use App\Modules\Order\Services\OrderService;
use App\Modules\Service\Services\ServiceCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * PRD 17 "Orders — User": Pesan Layanan & Pesanan Saya.
 */
class OrderController extends Controller
{
    public function __construct(
        protected OrderService $orders
    ) {}

    // GET /orders
    public function index(Request $request): Response
    {
        return Inertia::render('Orders/Index', [
            // fn() → ikut diperbarui saat polling realtime di frontend
            'orders' => fn () => $this->orders->paginateForUser($request->user()),
        ]);
    }

    // GET /orders/create?service=3  (service opsional: layanan yang sudah dipilih)
    public function create(Request $request, ServiceCatalog $catalog, AddressService $addresses): Response
    {
        return Inertia::render('Orders/Create', [
            'services' => $catalog->all(),
            // Buku alamat: alamat utama di urutan pertama → otomatis terpilih di formulir.
            'addresses' => $addresses->listFor($request->user()),
            'selectedServiceId' => $request->integer('service') ?: null,
        ]);
    }

    // POST /orders
    public function store(StoreOrderRequest $request): RedirectResponse
    {
        $order = $this->orders->createFor($request->user(), $request->validated());

        // Langsung ke halaman pembayaran, seperti checkout di e-commerce.
        return redirect()
            ->route('orders.payment', $order)
            ->with('success', 'Pesanan berhasil dibuat. Silakan pilih metode pembayaran.');
    }

    // GET /orders/{order}
    public function show(Order $order): Response
    {
        // Cek OrderPolicy::view → 403 jika pesanan milik orang lain.
        Gate::authorize('view', $order);

        return Inertia::render('Orders/Show', [
            'order' => fn () => $order->load(['service:id,name,price,description', 'payment']),
        ]);
    }

    // PATCH /orders/{order}/cancel
    public function cancel(Order $order): RedirectResponse
    {
        // Cek OrderPolicy::cancel → hanya pemilik & status masih Menunggu.
        Gate::authorize('cancel', $order);

        $this->orders->cancel($order);

        return back()->with('success', 'Pesanan berhasil dibatalkan.');
    }
}
