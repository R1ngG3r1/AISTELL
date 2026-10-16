<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Petugas lapangan: hanya data yang dicatat admin (tanpa akun/login).
 * Nama tabelnya "staff" (bentuk jamak dan tunggalnya sama dalam bahasa Inggris).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('phone', 20);
            // Petugas nonaktif (cuti/berhenti) tidak bisa ditugaskan lagi, tapi riwayatnya tetap utuh.
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
