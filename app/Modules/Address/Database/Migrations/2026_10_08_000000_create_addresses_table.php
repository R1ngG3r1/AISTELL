<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Buku alamat user (seperti di e-commerce): satu user bisa menyimpan banyak alamat,
 * salah satunya alamat utama (is_primary) yang otomatis mengisi lokasi saat memesan.
 *
 * Menggantikan kolom users.address. Alamat lama dipindahkan ke tabel ini sebagai
 * alamat utama berlabel "Rumah" (tanpa titik peta, user bisa menambahkannya nanti).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('label', 50); // Rumah, Kantor, Kos, …
            $table->text('address'); // alamat lengkap (bisa terisi otomatis dari titik peta)
            $table->string('detail', 255)->nullable(); // no. rumah, blok, patokan
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->boolean('is_primary')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'is_primary']);
        });

        $now = now();
        DB::table('users')->whereNotNull('address')->where('address', '!=', '')->orderBy('id')
            ->each(function ($user) use ($now) {
                DB::table('addresses')->insert([
                    'user_id' => $user->id,
                    'label' => 'Rumah',
                    'address' => $user->address,
                    'is_primary' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('address');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('address')->nullable()->after('avatar_path');
        });

        DB::table('addresses')->where('is_primary', true)->orderBy('id')
            ->each(fn ($a) => DB::table('users')->where('id', $a->user_id)->update(['address' => $a->address]));

        Schema::dropIfExists('addresses');
    }
};
