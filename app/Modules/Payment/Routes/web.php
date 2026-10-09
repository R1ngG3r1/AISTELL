<?php

use App\Modules\Payment\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;

/*
| Pembayaran pesanan (DUMMY) → hanya role user, pemilik pesanan (OrderPolicy).
*/

Route::middleware(['auth', 'role:user'])->group(function () {
    Route::get('/orders/{order}/payment', [PaymentController::class, 'show'])->whereNumber('order')->name('orders.payment');
    Route::post('/orders/{order}/payment', [PaymentController::class, 'store'])->whereNumber('order')->middleware('throttle:20,1')->name('orders.payment.store');
    Route::post('/orders/{order}/payment/confirm', [PaymentController::class, 'confirm'])->whereNumber('order')->middleware('throttle:20,1')->name('orders.payment.confirm');
});
