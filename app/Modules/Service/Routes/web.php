<?php

use App\Modules\Service\Controllers\AdminServiceController;
use App\Modules\Service\Controllers\ServiceController;
use Illuminate\Support\Facades\Route;

/*
| File ini otomatis dimuat oleh ModuleServiceProvider (dengan middleware 'web').
| Cek hasilnya dengan: php artisan route:list --path=services
*/

// Melihat layanan: semua akun yang login (user & admin), PRD 13.
Route::middleware('auth')->group(function () {
    Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
    Route::get('/services/{service}', [ServiceController::class, 'show'])
        ->whereNumber('service')
        ->name('services.show');
});

// Mengelola layanan: khusus admin.
// prefix('admin') → URL diawali /admin; name('admin.') → nama route diawali admin.
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/services', [AdminServiceController::class, 'index'])->name('services.index');
    Route::post('/services', [AdminServiceController::class, 'store'])->name('services.store');
    Route::put('/services/{service}', [AdminServiceController::class, 'update'])->name('services.update');
    Route::delete('/services/{service}', [AdminServiceController::class, 'destroy'])->name('services.destroy');
});
