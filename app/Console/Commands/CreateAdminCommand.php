<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

/**
 * Membuat akun admin baru, atau menjadikan akun yang sudah ada sebagai admin.
 *
 *   php artisan aistel:create-admin                        (ditanya satu per satu)
 *   php artisan aistel:create-admin budi@aistel.id --name="Budi" --password="rahasia123"
 *
 * Password otomatis di-hash oleh model User (cast 'hashed'), jadi aman.
 */
class CreateAdminCommand extends Command
{
    protected $signature = 'aistel:create-admin
                            {email? : Email akun admin}
                            {--name= : Nama admin}
                            {--password= : Password (minimal 8 karakter)}';

    protected $description = 'Membuat akun admin baru atau menjadikan akun yang sudah ada sebagai admin';

    public function handle(): int
    {
        $email = $this->argument('email') ?? $this->ask('Email admin');

        if (Validator::make(['email' => $email], ['email' => 'required|email'])->fails()) {
            $this->error('Format email tidak valid.');

            return self::FAILURE;
        }

        // Email sudah terdaftar → cukup ubah role-nya menjadi admin.
        $existing = User::where('email', $email)->first();
        if ($existing) {
            if ($existing->isAdmin()) {
                $this->info("{$email} sudah menjadi admin.");

                return self::SUCCESS;
            }

            // Dengan opsi -n (tanpa interaksi), confirm() otomatis memakai jawaban default (ya).
            if (! $this->confirm("{$email} sudah terdaftar sebagai user. Jadikan admin?", true)) {
                return self::FAILURE;
            }

            $existing->role = User::ROLE_ADMIN;
            $existing->save();
            $this->info("{$email} sekarang menjadi admin.");

            return self::SUCCESS;
        }

        $name = $this->option('name') ?? $this->ask('Nama admin', 'Admin AISTEL');
        $password = $this->option('password') ?? $this->secret('Password (minimal 8 karakter, tidak terlihat saat diketik)');

        $validator = Validator::make(
            ['name' => $name, 'password' => $password],
            ['name' => 'required|string|max:255', 'password' => ['required', Password::min(8)]],
        );
        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->error($message);
            }

            return self::FAILURE;
        }

        $admin = new User(['name' => $name, 'email' => $email, 'password' => $password]);
        $admin->role = User::ROLE_ADMIN; // role tidak ada di $fillable, jadi diisi langsung
        $admin->email_verified_at = now();
        $admin->save();

        $this->info("Admin {$email} berhasil dibuat. Silakan login di /login.");

        return self::SUCCESS;
    }
}
