<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Halaman Profil Saya:
 * - avatar_path: lokasi file foto profil di storage/app/private/avatars (null = pakai inisial)
 * - address: alamat utama, otomatis mengisi kolom lokasi saat memesan layanan
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar_path')->nullable()->after('phone');
            $table->text('address')->nullable()->after('avatar_path');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar_path', 'address']);
        });
    }
};
