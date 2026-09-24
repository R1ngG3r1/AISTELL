<?php

use App\Modules\User\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Daftar semua akun berisi email orang lain → khusus admin.
Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
});
