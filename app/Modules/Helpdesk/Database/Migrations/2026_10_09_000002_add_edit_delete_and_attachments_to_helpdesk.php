<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * - edited_at / deleted_at pada pesan: edit & hapus pesan seperti WhatsApp.
 *   Pesan yang dihapus tidak dibuang barisnya (menjadi "Pesan ini telah dihapus"), isinya dikosongkan.
 * - helpdesk_attachments: lampiran (foto/dokumen) disimpan LANGSUNG di database sebagai base64,
 *   sehingga tidak butuh storage / storage:link. Dipisah dari tabel pesan agar daftar chat tetap ringan.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('helpdesk_messages', function (Blueprint $table) {
            $table->text('body')->nullable()->change(); // pesan hanya-lampiran boleh tanpa teks
            $table->timestamp('edited_at')->nullable()->after('body');
            $table->timestamp('deleted_at')->nullable()->after('edited_at');
            $table->index(['thread_id', 'updated_at']);
        });

        Schema::create('helpdesk_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->unique()->constrained('helpdesk_messages')->cascadeOnDelete();
            $table->string('name', 255);
            $table->string('mime', 100);
            $table->unsignedInteger('size'); // byte
            $table->longText('data'); // isi file, base64
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('helpdesk_attachments');

        Schema::table('helpdesk_messages', function (Blueprint $table) {
            $table->dropIndex(['thread_id', 'updated_at']);
            $table->dropColumn(['edited_at', 'deleted_at']);
        });
    }
};
