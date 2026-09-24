<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

/**
 * Membuat akun admin. Aman dijalankan berkali-kali (tidak membuat duplikat).
 *
 * Lokal     : php artisan db:seed            (ikut dipanggil DatabaseSeeder)
 * Production: php artisan db:seed --class=AdminSeeder --force
 *
 * Atur di .env:  ADMIN_EMAIL=...  ADMIN_PASSWORD=...
 */
class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@aistel.test');
        $password = env('ADMIN_PASSWORD');

        // Di production password admin WAJIB diatur, tidak boleh memakai default.
        if (! $password) {
            if (app()->isProduction()) {
                throw new RuntimeException('ADMIN_PASSWORD wajib diisi di .env production.');
            }
            $password = 'password';
        }

        // firstOrNew: cari admin berdasarkan email; jika belum ada, siapkan objek baru.
        $admin = User::firstOrNew(['email' => $email]);
        $admin->fill([
            'name' => 'Admin AISTEL',
            'password' => $password, // otomatis di-hash oleh cast 'hashed' di model User
        ]);
        // role diisi langsung (bukan lewat fill) karena tidak ada di $fillable.
        $admin->role = User::ROLE_ADMIN;
        $admin->email_verified_at ??= now();
        $admin->save();
    }
}
