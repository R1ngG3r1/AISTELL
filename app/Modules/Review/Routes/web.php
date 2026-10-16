<?php

use App\Modules\Review\Controllers\ReviewController;
use Illuminate\Support\Facades\Route;

/* Ulasan: hanya role user, pemilik pesanan selesai (OrderPolicy::review). */

Route::middleware(['auth', 'verified', 'role:user'])->group(function () {
    Route::post('/orders/{order}/review', [ReviewController::class, 'store'])->whereNumber('order')->middleware('throttle:10,1')->name('orders.review.store');
    Route::put('/orders/{order}/review', [ReviewController::class, 'update'])->whereNumber('order')->middleware('throttle:20,1')->name('orders.review.update');
    Route::delete('/orders/{order}/review', [ReviewController::class, 'destroy'])->whereNumber('order')->middleware('throttle:20,1')->name('orders.review.destroy');
});
