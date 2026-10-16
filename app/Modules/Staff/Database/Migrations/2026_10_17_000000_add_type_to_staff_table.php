<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            // solo = turun sendiri, tim = bersama tim (nama petugas = penanggung jawab).
            // Daftar nilai harus sama dengan App\Modules\Staff\Enums\StaffType.
            $table->enum('type', ['solo', 'tim'])->default('solo')->after('phone');
        });
    }

    public function down(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
