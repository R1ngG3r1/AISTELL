<?php

use App\Modules\Report\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

/* Laporan: khusus admin. */

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/export', [ReportController::class, 'export'])->middleware('throttle:10,1')->name('reports.export');
    Route::get('/reports/pdf', [ReportController::class, 'pdf'])->middleware('throttle:10,1')->name('reports.pdf');
});
