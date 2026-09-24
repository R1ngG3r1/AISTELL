<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * PRD 16.3 — tabel `orders`: penghubung users ↔ services (siapa memesan apa).
 *
 * Nama file diawali tanggal yang LEBIH BESAR dari migrasi services, karena
 * foreign key ke `services` hanya bisa dibuat setelah tabel services ada.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            // foreignId + constrained() = kolom BIGINT + FOREIGN KEY ke users.id.
            // cascadeOnDelete: jika akun user dihapus, pesanannya ikut terhapus.
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // restrictOnDelete: layanan yang sudah pernah dipesan TIDAK bisa dihapus,
            // supaya riwayat pesanan tidak kehilangan data layanannya.
            $table->foreignId('service_id')->constrained()->restrictOnDelete();

            $table->date('date');
            $table->time('time');
            $table->text('location');

            // PRD 12 meminta "nama pemesan" & "nomor kontak". Disimpan per pesanan
            // karena bisa berbeda dengan pemilik akun (mis. memesan untuk orang tua).
            $table->string('contact_name');
            $table->string('contact_phone', 20);

            $table->text('notes')->nullable();

            // Daftar nilai harus sama dengan App\Modules\Order\Enums\OrderStatus.
            $table->enum('status', ['menunggu', 'diproses', 'selesai', 'ditolak', 'dibatalkan'])
                ->default('menunggu');

            $table->timestamps();

            // Index mempercepat query yang sering dipakai: "pesanan milik user X"
            // dan "filter pesanan berdasarkan status" di halaman admin.
            $table->index(['user_id', 'created_at']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
