<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Harga dikunci di setiap pesanan.
 *
 * Sebelumnya pesanan hanya menampilkan harga layanan SAAT INI, sehingga jika admin
 * menaikkan harga, riwayat pesanan lama ikut berubah. Kolom ini menyimpan harga
 * pada saat pesanan dibuat. Pesanan lama diisi dari harga layanan sekarang.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('price', 12, 2)->nullable()->after('service_id');
        });

        DB::table('orders')->update([
            'price' => DB::raw('(SELECT services.price FROM services WHERE services.id = orders.service_id)'),
        ]);
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('price');
        });
    }
};
