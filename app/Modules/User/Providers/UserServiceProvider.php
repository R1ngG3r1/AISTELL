<?php

namespace App\Modules\User\Providers;

use Illuminate\Support\ServiceProvider;

class UserServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Module-specific bindings or singletons can be defined here
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Module-specific event listeners or boot logic
    }
}
