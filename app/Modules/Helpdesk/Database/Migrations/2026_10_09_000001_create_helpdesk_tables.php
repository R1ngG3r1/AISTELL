<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Helpdesk: satu percakapan (thread) per user dengan admin, berisi banyak pesan.
 * Status "sudah dibaca" disimpan sebagai id pesan terakhir yang dilihat tiap pihak.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('helpdesk_threads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('user_read_message_id')->default(0);
            $table->unsignedBigInteger('admin_read_message_id')->default(0);
            $table->timestamp('last_message_at')->nullable()->index();
            $table->timestamps();
        });

        Schema::create('helpdesk_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('thread_id')->constrained('helpdesk_threads')->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->boolean('from_admin')->default(false);
            $table->text('body');
            $table->timestamps();

            $table->index(['thread_id', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('helpdesk_messages');
        Schema::dropIfExists('helpdesk_threads');
    }
};
