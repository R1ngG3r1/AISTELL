<?php

use App\Modules\Order\Controllers\AdminOrderController;
use App\Modules\Order\Controllers\OrderController;
use Illuminate\Support\Facades\Route;

/*
| PRD 13: membuat & melihat pesanan sendiri → hanya role user.
|         melihat seluruh pesanan & mengubah status → hanya role admin.
*/

Route::middleware(['auth', 'role:user'])->group(function () {
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    // /orders/create didefinisikan SEBELUM /orders/{order}, dan {order} dibatasi
    // angka (whereNumber), supaya kata "create" tidak dianggap sebagai id pesanan.
    Route::get('/orders/create', [OrderController::class, 'create'])->name('orders.create');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->whereNumber('order')->name('orders.show');
    Route::patch('/orders/{order}/cancel', [OrderController::class, 'cancel'])->whereNumber('order')->name('orders.cancel');
});

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [AdminOrderController::class, 'show'])->whereNumber('order')->name('orders.show');
    Route::put('/orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->whereNumber('order')->name('orders.status');
});
