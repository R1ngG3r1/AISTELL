<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Titik peta lokasi layanan (dipilih di formulir pemesanan), agar admin/petugas
 * bisa langsung membuka rute di Google Maps. Opsional: pesanan lama tetap null.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('latitude', 10, 7)->nullable()->after('location');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude']);
        });
    }
};
