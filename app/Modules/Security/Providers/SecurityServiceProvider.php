<?php

namespace App\Modules\Security\Providers;

use App\Modules\Security\Listeners\RecordAdminLogin;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

/**
 * Otomatis didaftarkan oleh ModuleServiceProvider. Middleware (SecurityHeaders, AdminIdleTimeout)
 * didaftarkan di bootstrap/app.php karena grup middleware web dibangun ulang oleh kernel.
 */
class SecurityServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Event::listen(Login::class, RecordAdminLogin::class);
    }
}
