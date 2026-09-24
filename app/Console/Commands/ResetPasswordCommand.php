<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

/**
 * Mengganti password akun mana pun (mis. user lupa password dan email belum disetel).
 *
 *   php artisan aistel:reset-password budi@aistel.id
 */
class ResetPasswordCommand extends Command
{
    protected $signature = 'aistel:reset-password
                            {email : Email akun}
                            {--password= : Password baru (minimal 8 karakter)}';

    protected $description = 'Mengganti password sebuah akun';

    public function handle(): int
    {
        $user = User::where('email', $this->argument('email'))->first();
        if (! $user) {
            $this->error('Akun dengan email tersebut tidak ditemukan.');

            return self::FAILURE;
        }

        $password = $this->option('password') ?? $this->secret('Password baru (minimal 8 karakter)');
        if (strlen((string) $password) < 8) {
            $this->error('Password minimal 8 karakter.');

            return self::FAILURE;
        }

        $user->password = $password; // otomatis di-hash oleh model
        $user->save();

        $this->info("Password {$user->email} berhasil diganti.");

        return self::SUCCESS;
    }
}
