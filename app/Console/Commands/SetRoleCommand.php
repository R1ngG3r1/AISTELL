<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

/**
 * Mengubah role akun: user ↔ admin.
 *
 *   php artisan aistel:set-role budi@aistel.id admin
 *   php artisan aistel:set-role budi@aistel.id user
 */
class SetRoleCommand extends Command
{
    protected $signature = 'aistel:set-role
                            {email : Email akun}
                            {role : user atau admin}';

    protected $description = 'Mengubah role akun menjadi user atau admin';

    public function handle(): int
    {
        $role = $this->argument('role');
        if (! in_array($role, [User::ROLE_USER, User::ROLE_ADMIN], true)) {
            $this->error('Role harus "user" atau "admin".');

            return self::FAILURE;
        }

        $user = User::where('email', $this->argument('email'))->first();
        if (! $user) {
            $this->error('Akun dengan email tersebut tidak ditemukan.');

            return self::FAILURE;
        }

        // Jangan sampai sistem tidak punya admin sama sekali.
        if ($user->isAdmin() && $role === User::ROLE_USER
            && User::where('role', User::ROLE_ADMIN)->count() === 1) {
            $this->error('Ini satu-satunya admin. Buat admin lain terlebih dahulu.');

            return self::FAILURE;
        }

        $user->role = $role;
        $user->save();

        $this->info("Role {$user->email} sekarang: {$role}.");

        return self::SUCCESS;
    }
}
