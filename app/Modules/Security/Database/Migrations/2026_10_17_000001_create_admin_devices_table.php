<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Browser/perangkat yang pernah dipakai admin masuk; yang baru memicu pemberitahuan. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('fingerprint', 64); // sha256 dari User-Agent
            $table->string('label', 100); // "Chrome di Windows"
            $table->string('last_ip', 45)->nullable();
            $table->timestamp('last_seen_at');
            $table->timestamps();

            $table->unique(['user_id', 'fingerprint']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_devices');
    }
};
