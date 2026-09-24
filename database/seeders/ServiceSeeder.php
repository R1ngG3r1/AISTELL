<?php

namespace Database\Seeders;

use App\Modules\Service\Models\Service;
use Illuminate\Database\Seeder;

/** Layanan awal AISTEL. Nama dan harga bisa diubah admin lewat menu Kelola Layanan. */
class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            ['name' => 'Bersih Rumah', 'price' => 150000, 'description' => 'Menyapu, mengepel, dan merapikan seluruh ruangan rumah.'],
            ['name' => 'Potong Rumput & Taman', 'price' => 120000, 'description' => 'Memotong rumput, merapikan tanaman, dan membersihkan halaman.'],
            ['name' => 'Angkut Sampah', 'price' => 75000, 'description' => 'Mengangkut sampah rumah tangga dan memilah sampah organik/anorganik.'],
            ['name' => 'Bersih Selokan', 'price' => 100000, 'description' => 'Membersihkan saluran air dan selokan dari sampah dan endapan.'],
            ['name' => 'Bersih Lingkungan RT/RW', 'price' => 500000, 'description' => 'Kerja bakti membersihkan area umum lingkungan RT/RW.'],
        ];

        foreach ($services as $service) {
            // updateOrCreate: kalau nama sudah ada → update, kalau belum → buat baru.
            Service::updateOrCreate(['name' => $service['name']], $service);
        }
    }
}
