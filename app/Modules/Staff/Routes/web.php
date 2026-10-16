<?php

use App\Modules\Staff\Controllers\AdminStaffController;
use App\Modules\Staff\Controllers\OrderStaffController;
use Illuminate\Support\Facades\Route;

/* Petugas lapangan: dikelola dan ditugaskan oleh admin saja (petugas tidak punya akun). */

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/staff', [AdminStaffController::class, 'index'])->name('staff.index');
    Route::post('/staff', [AdminStaffController::class, 'store'])->name('staff.store');
    Route::put('/staff/{staff}', [AdminStaffController::class, 'update'])->whereNumber('staff')->name('staff.update');
    Route::delete('/staff/{staff}', [AdminStaffController::class, 'destroy'])->whereNumber('staff')->name('staff.destroy');

    Route::put('/orders/{order}/staff', [OrderStaffController::class, 'update'])->whereNumber('order')->name('orders.staff');
});
