<?php

use App\Models\User;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use Inertia\Testing\AssertableInertia as Assert;

/*
| Test Kelola Pesanan oleh Admin (PRD 14). Jalankan: php artisan test --filter=AdminOrderTest
*/

it('pesanan user dapat dilihat oleh admin', function () {
    $admin = User::factory()->admin()->create();
    Order::factory()->count(3)->create();

    $this->actingAs($admin)->get('/admin/orders')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Orders/Index')
            ->has('orders.data', 3)
            ->has('orders.data.0.user.name')
            ->has('statuses', 5));
});

it('admin dapat memfilter pesanan berdasarkan status', function () {
    $admin = User::factory()->admin()->create();
    Order::factory()->count(2)->create();
    Order::factory()->status(OrderStatus::Selesai)->create();

    $this->actingAs($admin)->get('/admin/orders?status=selesai')
        ->assertInertia(fn (Assert $page) => $page
            ->has('orders.data', 1)
            ->where('filters.status', 'selesai'));
});

it('admin melihat detail pesanan beserta pilihan status berikutnya', function () {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->create();

    $this->actingAs($admin)->get("/admin/orders/{$order->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Orders/Show')
            ->where('order.id', $order->id)
            ->has('order.user.phone')
            ->where('allowedStatuses.0.value', 'diproses'));
});

it('admin dapat menerima pesanan', function () {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->create();

    $this->actingAs($admin)
        ->put("/admin/orders/{$order->id}/status", ['status' => 'diproses'])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    expect($order->fresh()->status)->toBe(OrderStatus::Diproses);
});

it('admin dapat menolak pesanan', function () {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->create();

    $this->actingAs($admin)->put("/admin/orders/{$order->id}/status", ['status' => 'ditolak']);

    expect($order->fresh()->status)->toBe(OrderStatus::Ditolak);
});

it('admin dapat memperbarui status menjadi selesai dan user melihat perubahannya', function () {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->status(OrderStatus::Diproses)->create();

    $this->actingAs($admin)->put("/admin/orders/{$order->id}/status", ['status' => 'selesai']);

    // Kriteria terakhir PRD 14: user melihat perubahan status pesanannya.
    $this->actingAs($order->user)->get("/orders/{$order->id}")
        ->assertInertia(fn (Assert $page) => $page->where('order.status', 'selesai'));
});

it('menolak perubahan status yang tidak diizinkan', function (OrderStatus $from, string $to) {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->status($from)->create();

    $this->actingAs($admin)
        ->put("/admin/orders/{$order->id}/status", ['status' => $to])
        ->assertSessionHasErrors('status');

    expect($order->fresh()->status)->toBe($from);
})->with([
    'selesai → menunggu' => [OrderStatus::Selesai, 'menunggu'],
    'ditolak → diproses' => [OrderStatus::Ditolak, 'diproses'],
    'menunggu → selesai (lompat)' => [OrderStatus::Menunggu, 'selesai'],
    'status tidak dikenal' => [OrderStatus::Menunggu, 'hilang'],
]);

it('user biasa tidak dapat membuka atau mengubah pesanan lewat halaman admin', function () {
    $user = User::factory()->create();
    $order = Order::factory()->for($user)->create();

    $this->actingAs($user)->get('/admin/orders')->assertForbidden();
    $this->actingAs($user)->put("/admin/orders/{$order->id}/status", ['status' => 'selesai'])->assertForbidden();

    expect($order->fresh()->status)->toBe(OrderStatus::Menunggu);
});
