<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // restrictOnDelete: petugas yang pernah ditugaskan tidak bisa dihapus (nonaktifkan saja),
            // supaya riwayat pesanan tidak kehilangan data petugasnya.
            $table->foreignId('staff_id')->nullable()->after('service_id')->constrained('staff')->restrictOnDelete();

            // Dipakai untuk mencari jadwal petugas yang bentrok.
            $table->index(['staff_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['staff_id']);
            $table->dropIndex(['staff_id', 'date']);
            $table->dropColumn('staff_id');
        });
    }
};
