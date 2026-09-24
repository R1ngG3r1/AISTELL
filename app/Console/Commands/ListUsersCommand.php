<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

/**
 * Menampilkan daftar akun dalam bentuk tabel.
 *
 *   php artisan aistel:users
 *   php artisan aistel:users --role=admin
 */
class ListUsersCommand extends Command
{
    protected $signature = 'aistel:users {--role= : Filter: user atau admin}';

    protected $description = 'Menampilkan daftar akun beserta role dan jumlah pesanan';

    public function handle(): int
    {
        $users = User::query()
            ->when($this->option('role'), fn ($q, $role) => $q->where('role', $role))
            ->withCount('orders')
            ->orderBy('id')
            ->get();

        $this->table(
            ['ID', 'Nama', 'Email', 'Telepon', 'Role', 'Pesanan', 'Dibuat'],
            $users->map(fn (User $u) => [
                $u->id, $u->name, $u->email, $u->phone ?? '-', $u->role, $u->orders_count, $u->created_at?->format('d-m-Y'),
            ]),
        );

        return self::SUCCESS;
    }
}
