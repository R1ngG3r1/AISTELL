<?php

use App\Modules\Address\Controllers\AddressController;
use Illuminate\Support\Facades\Route;

/*
| Buku alamat → hanya role user (admin tidak memesan layanan).
*/

Route::middleware(['auth', 'role:user'])->group(function () {
    Route::post('/addresses', [AddressController::class, 'store'])->middleware('throttle:20,1')->name('addresses.store');
    Route::put('/addresses/{address}', [AddressController::class, 'update'])->whereNumber('address')->name('addresses.update');
    Route::patch('/addresses/{address}/primary', [AddressController::class, 'primary'])->whereNumber('address')->name('addresses.primary');
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy'])->whereNumber('address')->name('addresses.destroy');
});
