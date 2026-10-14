<?php

use App\Modules\Helpdesk\Controllers\AdminHelpdeskController;
use App\Modules\Helpdesk\Controllers\HelpdeskController;
use App\Modules\Helpdesk\Controllers\HelpdeskMessageController;
use Illuminate\Support\Facades\Route;

/*
| Helpdesk: user ↔ admin. Chat memakai polling singkat ke endpoint JSON "messages"
| (tanpa WebSocket, sama seperti fitur realtime lain di aplikasi ini).
*/

Route::middleware(['auth', 'verified', 'role:user'])->group(function () {
    Route::get('/helpdesk', [HelpdeskController::class, 'index'])->name('helpdesk.index');
    Route::get('/helpdesk/messages', [HelpdeskController::class, 'messages'])->middleware('throttle:120,1')->name('helpdesk.messages');
    Route::post('/helpdesk/messages', [HelpdeskController::class, 'store'])->middleware('throttle:30,1')->name('helpdesk.store');
});

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/helpdesk', [AdminHelpdeskController::class, 'index'])->name('helpdesk.index');
    Route::get('/helpdesk/{thread}/messages', [AdminHelpdeskController::class, 'messages'])->whereNumber('thread')->middleware('throttle:120,1')->name('helpdesk.messages');
    Route::post('/helpdesk/{thread}/messages', [AdminHelpdeskController::class, 'store'])->whereNumber('thread')->middleware('throttle:60,1')->name('helpdesk.store');
});

// Dipakai user maupun admin; kepemilikan dicek di controller (hanya pengirim yang boleh edit/hapus).
Route::middleware('auth')->group(function () {
    Route::patch('/helpdesk/messages/{message}', [HelpdeskMessageController::class, 'update'])->whereNumber('message')->middleware('throttle:60,1')->name('helpdesk.messages.update');
    Route::delete('/helpdesk/messages/{message}', [HelpdeskMessageController::class, 'destroy'])->whereNumber('message')->middleware('throttle:60,1')->name('helpdesk.messages.destroy');
    Route::get('/helpdesk/attachments/{attachment}', [HelpdeskMessageController::class, 'attachment'])->whereNumber('attachment')->name('helpdesk.attachments.show');
});
