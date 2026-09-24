<?php

namespace App\Modules\Order\Providers;

use App\Modules\Order\Models\Order;
use App\Modules\Order\Policies\OrderPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

/**
 * Otomatis didaftarkan oleh ModuleServiceProvider karena namanya mengikuti
 * pola Modules/<Nama>/Providers/<Nama>ServiceProvider.
 */
class OrderServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Model ada di dalam modul, jadi Laravel tidak bisa menebak policy-nya
        // secara otomatis. Di sini kita hubungkan secara manual.
        Gate::policy(Order::class, OrderPolicy::class);
    }
}
