<?php

namespace App\Modules\Payment\Providers;

use App\Modules\Order\Models\Order;
use App\Modules\Payment\Services\PaymentService;
use Illuminate\Support\ServiceProvider;

/** Otomatis didaftarkan oleh ModuleServiceProvider. */
class PaymentServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Status pembayaran mengikuti status pesanan (refund saat ditolak/batal,
        // tunai lunas saat selesai) tanpa perlu mengubah OrderService.
        Order::updated(function (Order $order) {
            if ($order->wasChanged('status')) {
                app(PaymentService::class)->syncWithOrder($order);
            }
        });
    }
}
