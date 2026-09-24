<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * PRD 16.1 — tabel `users` butuh kolom `role` (user/admin) dan `phone`.
 *
 * Tabel users sudah dibuat oleh migrasi bawaan Laravel, jadi di sini kita
 * hanya MENAMBAH kolom (Schema::table), bukan membuat tabel baru (Schema::create).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 20)->nullable()->after('email');
            // Default 'user' → setiap akun hasil register otomatis jadi user biasa.
            // Akun admin hanya dibuat lewat seeder (lihat AdminSeeder).
            $table->enum('role', ['user', 'admin'])->default('user')->after('password');
        });
    }

    // down() dijalankan saat `php artisan migrate:rollback`: kebalikan dari up().
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'role']);
        });
    }
};
