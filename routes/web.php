<?php

use App\Http\Controllers\ProfileController;
use App\Modules\Service\Services\ServiceCatalog;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
| Route utama aplikasi. Route per fitur ada di masing-masing modul:
|   app/Modules/Dashboard/Routes/web.php → /dashboard, /admin/dashboard
|   app/Modules/Service/Routes/web.php   → /services, /admin/services
|   app/Modules/Order/Routes/web.php     → /orders, /admin/orders
| Lihat semuanya: php artisan route:list
*/

// Landing page (PRD 6.1): publik, menerima daftar layanan untuk section "Layanan".
Route::get('/', function (ServiceCatalog $catalog) {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'services' => $catalog->all(),
    ]);
})->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
