<?php

namespace App\Modules\Payment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Order\Models\Order;
use App\Modules\Payment\Enums\PaymentMethod;
use App\Modules\Payment\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** Halaman pembayaran pesanan (DUMMY) untuk user. */
class PaymentController extends Controller
{
    public function __construct(
        protected PaymentService $payments
    ) {}

    // GET /orders/{order}/payment
    public function show(Order $order): Response
    {
        Gate::authorize('view', $order);

        return Inertia::render('Payments/Show', [
            // fn() → ikut diperbarui saat polling, mis. status berubah menjadi Lunas
            'order' => fn () => $order->fresh()->load('service:id,name,price'),
            'payment' => fn () => $this->payments->current($order),
            'methods' => $this->payments->methodOptions(),
        ]);
    }

    // POST /orders/{order}/payment   body: { method: "va_bca" }
    public function store(Request $request, Order $order): RedirectResponse
    {
        Gate::authorize('pay', $order);

        $data = $request->validate(
            ['method' => ['required', Rule::enum(PaymentMethod::class)]],
            ['method.required' => 'Pilih metode pembayaran terlebih dahulu.'],
        );

        $payment = $this->payments->create($order, PaymentMethod::from($data['method']));

        return redirect()->route('orders.payment', $order)->with(
            'success',
            $payment->method === PaymentMethod::Cod
                ? 'Metode bayar tunai dipilih. Siapkan uang pas saat petugas datang.'
                : 'Kode pembayaran dibuat. Pembayaran sedang diproses…',
        );
    }

    // POST /orders/{order}/payment/confirm   (DUMMY: pengganti notifikasi dari payment gateway, dipanggil otomatis oleh halaman)
    public function confirm(Order $order): RedirectResponse
    {
        Gate::authorize('pay', $order);

        $payment = $this->payments->current($order);
        abort_if(! $payment, 422, 'Belum ada tagihan.');

        $this->payments->confirmPaid($payment);

        return redirect()->route('orders.payment', $order)->with('success', 'Pembayaran berhasil! Pesanan Anda akan segera diproses admin.');
    }
}
