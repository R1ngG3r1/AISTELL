<?php

namespace App\Modules\Order\Policies;

use App\Models\User;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;

/**
 * Policy = aturan "siapa boleh melakukan apa" terhadap SATU data tertentu.
 *
 * Middleware role hanya mengecek jenis akun. Policy mengecek kepemilikan:
 * tanpa ini, user A bisa membuka /orders/5 milik user B hanya dengan mengganti angka di URL.
 *
 * Dipanggil di controller dengan: Gate::authorize('view', $order)
 * Didaftarkan di OrderServiceProvider.
 */
class OrderPolicy
{
    /** Admin boleh melihat semua pesanan; user hanya pesanan miliknya. */
    public function view(User $user, Order $order): bool
    {
        return $user->isAdmin() || $order->user_id === $user->id;
    }

    /** User hanya bisa membatalkan pesanannya sendiri yang belum diproses admin. */
    public function cancel(User $user, Order $order): bool
    {
        return $order->user_id === $user->id
            && $order->status === OrderStatus::Menunggu;
    }
}
