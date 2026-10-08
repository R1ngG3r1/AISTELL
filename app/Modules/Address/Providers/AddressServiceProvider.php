<?php

namespace App\Modules\Address\Providers;

use App\Modules\Address\Models\Address;
use App\Modules\Address\Policies\AddressPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

/** Otomatis didaftarkan oleh ModuleServiceProvider. */
class AddressServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Gate::policy(Address::class, AddressPolicy::class);
    }
}
