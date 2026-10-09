<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Helpdesk\Services\HelpdeskService;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Service\Models\Service;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Jalankan: php artisan migrate:fresh --seed
     * (menghapus semua tabel lalu mengisi ulang: hanya untuk lokal!)
     */
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            ServiceSeeder::class,
        ]);

        // Data demo hanya untuk lokal, jangan sampai masuk ke production.
        if (app()->isProduction()) {
            return;
        }

        // Dua akun user: yang kedua dipakai untuk membuktikan bahwa
        // user A tidak bisa melihat pesanan user B.
        $user = $this->demoUser('user@aistel.test', 'User Demo', '081234567890');
        $user2 = $this->demoUser('user2@aistel.test', 'User Demo Dua', '081298765432');

        $services = Service::all();

        // Satu pesanan demo untuk setiap status, supaya semua tampilan bisa dicoba.
        // Dilewati jika user sudah punya pesanan → aman menjalankan `db:seed` berulang kali.
        if ($user->orders()->doesntExist()) {
            foreach (OrderStatus::cases() as $status) {
                $this->demoOrder($user, $services->random(), $status);
            }
        }

        if ($user2->orders()->doesntExist()) {
            $this->demoOrder($user2, $services->random(), OrderStatus::Menunggu);
        }

        $this->demoHelpdesk($user, User::where('email', env('ADMIN_EMAIL', 'admin@aistel.test'))->first());
    }

    /** Contoh percakapan helpdesk (hanya jika belum ada), supaya halaman chat tidak kosong saat dicoba. */
    private function demoHelpdesk(User $user, ?User $admin): void
    {
        $helpdesk = app(HelpdeskService::class);
        $thread = $helpdesk->threadFor($user);

        if (! $admin || $thread->messages()->exists()) {
            return;
        }

        $helpdesk->send($thread, $user, 'Halo admin, apakah jadwal angkut sampah saya sudah dikonfirmasi?');
        $helpdesk->send($thread, $admin, 'Halo! Pesanan Anda sedang kami proses, petugas akan datang sesuai jadwal. Ada yang bisa kami bantu lagi?');
    }

    private function demoUser(string $email, string $name, string $phone): User
    {
        return User::firstOrCreate(
            ['email' => $email],
            ['name' => $name, 'phone' => $phone, 'password' => 'password', 'email_verified_at' => now()],
        );
    }

    private function demoOrder(User $user, Service $service, OrderStatus $status): Order
    {
        return Order::factory()
            ->for($user)
            ->for($service)
            ->status($status)
            ->create(['contact_name' => $user->name, 'contact_phone' => $user->phone]);
    }
}
