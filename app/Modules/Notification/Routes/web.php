<?php

use App\Modules\Notification\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;

/* Notifikasi dalam aplikasi (lonceng): user maupun admin, hanya milik sendiri. */

Route::middleware('auth')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index'])->middleware('throttle:60,1')->name('notifications.index');
    Route::post('/notifications/read-all', [NotificationController::class, 'readAll'])->middleware('throttle:30,1')->name('notifications.read-all');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'read'])->whereUuid('id')->middleware('throttle:60,1')->name('notifications.read');
});
