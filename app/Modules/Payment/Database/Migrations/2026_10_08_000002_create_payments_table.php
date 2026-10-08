<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pembayaran pesanan (DUMMY). Satu pesanan bisa punya beberapa percobaan bayar
 * (mis. ganti metode / kedaluwarsa); yang dipakai adalah yang terbaru.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('method', 30); // App\Modules\Payment\Enums\PaymentMethod
            $table->decimal('amount', 12, 2); // harga pesanan + biaya layanan
            $table->decimal('fee', 12, 2)->default(0);
            $table->string('status', 20)->default('menunggu'); // PaymentStatus
            $table->string('reference', 40)->unique(); // no. transaksi, mis. AST-20261008-K3J9QX
            $table->text('code')->nullable(); // nomor VA / kode bayar gerai / payload QR
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
