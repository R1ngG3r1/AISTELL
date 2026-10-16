<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * PRD 16.2 - tabel `services`: daftar layanan kebersihan yang bisa dipesan.
 *
 * File ini berada di dalam modul, tetapi tetap ikut dijalankan oleh
 * `php artisan migrate` karena ModuleServiceProvider memanggil
 * loadMigrationsFrom() untuk setiap folder Modules/<Nama>/Database/Migrations.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            // decimal(12, 2) → maksimal 9.999.999.999,99; cukup untuk rupiah.
            // Jangan pakai float untuk uang karena bisa terjadi pembulatan.
            $table->decimal('price', 12, 2);
            $table->timestamps(); // created_at & updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
