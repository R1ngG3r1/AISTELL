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

    /** Membayar: hanya pemilik, dan pesanan masih berjalan (belum selesai/ditolak/batal). */
    public function pay(User $user, Order $order): bool
    {
        return $order->user_id === $user->id
            && in_array($order->status, OrderStatus::active(), true);
    }

    /** Mengulas: hanya pemilik, pesanan sudah selesai, dan belum pernah diulas. */
    public function review(User $user, Order $order): bool
    {
        return $order->user_id === $user->id
            && $order->status === OrderStatus::Selesai
            && ! $order->review()->exists();
    }

    /** Mengubah / menghapus ulasan: hanya pemilik pesanan, dan ulasannya memang ada. */
    public function manageReview(User $user, Order $order): bool
    {
        return $order->user_id === $user->id && $order->review()->exists();
    }

    /** User hanya bisa membatalkan pesanannya sendiri yang belum diproses admin. */
    public function cancel(User $user, Order $order): bool
    {
        return $order->user_id === $user->id
            && $order->status === OrderStatus::Menunggu;
    }
}
