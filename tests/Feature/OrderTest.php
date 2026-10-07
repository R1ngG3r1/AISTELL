<?php

use App\Models\User;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Service\Models\Service;
use Inertia\Testing\AssertableInertia as Assert;

/*
| Test alur pemesanan (PRD 7 & 14). Jalankan: php artisan test --filter=OrderTest
*/

/** Data form pesanan yang valid; bisa ditimpa per test. */
function validOrderData(array $overrides = []): array
{
    return array_merge([
        'service_id' => Service::factory()->create()->id,
        'contact_name' => 'Budi Santoso',
        'contact_phone' => '081234567890',
        'location' => 'Jl. Mawar No. 1, Bandung',
        'date' => now()->addDay()->toDateString(),
        'time' => '09:00',
        'notes' => 'Pagar warna hijau',
    ], $overrides);
}

it('user dapat mengajukan pesanan dengan status awal menunggu', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/orders', validOrderData());

    $order = Order::firstOrFail();
    $response->assertRedirect("/orders/{$order->id}");

    expect($order->user_id)->toBe($user->id)
        ->and($order->status)->toBe(OrderStatus::Menunggu);
});

it('harga dikunci saat pesanan dibuat, tidak ikut berubah saat harga layanan diubah', function () {
    $user = User::factory()->create();
    $service = Service::factory()->create(['price' => 150000]);

    $this->actingAs($user)->post('/orders', validOrderData(['service_id' => $service->id, 'price' => 1]));
    $service->update(['price' => 200000]);

    $order = Order::firstOrFail();
    expect($order->price)->toBe('150000.00');

    $this->actingAs($user)->get("/orders/{$order->id}")
        ->assertInertia(fn (Assert $page) => $page->where('order.price', '150000.00'));
});

it('pengiriman pesanan dibatasi agar tidak bisa di-spam', function () {
    $user = User::factory()->create();
    $data = validOrderData();

    foreach (range(1, 10) as $_) {
        $this->actingAs($user)->post('/orders', $data)->assertRedirect();
    }

    $this->actingAs($user)->post('/orders', $data)->assertStatus(429);
    expect(Order::count())->toBe(10);
});

it('user_id dan status dari form diabaikan', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    $this->actingAs($user)->post('/orders', validOrderData([
        'user_id' => $other->id,
        'status' => 'selesai',
    ]));

    $order = Order::firstOrFail();
    expect($order->user_id)->toBe($user->id)
        ->and($order->status)->toBe(OrderStatus::Menunggu);
});

it('memvalidasi data pesanan', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/orders', validOrderData([
            'service_id' => 999,
            'date' => now()->subDay()->toDateString(),
            'time' => '25:99',
            'contact_phone' => 'abc',
            'location' => '',
        ]))
        ->assertSessionHasErrors(['service_id', 'date', 'time', 'contact_phone', 'location']);

    expect(Order::count())->toBe(0);
});

it('pesan validasi tampil dalam bahasa Indonesia', function () {
    $this->actingAs(User::factory()->create())
        ->post('/orders', validOrderData(['location' => '']))
        ->assertSessionHasErrors(['location' => 'Lokasi layanan wajib diisi.']);
});

it('menolak jadwal hari ini yang jamnya sudah lewat', function () {
    $this->travelTo(today()->setTime(15, 0));
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/orders', validOrderData(['date' => today()->toDateString(), 'time' => '08:00']))
        ->assertSessionHasErrors(['time' => 'Waktu layanan sudah lewat. Pilih jam yang belum terlewati.']);

    $this->actingAs($user)
        ->post('/orders', validOrderData(['date' => today()->toDateString(), 'time' => '16:00']))
        ->assertSessionHasNoErrors();

    expect(Order::count())->toBe(1);
});

it('user hanya melihat pesanan miliknya sendiri', function () {
    $user = User::factory()->create();
    Order::factory()->count(2)->for($user)->create();
    Order::factory()->create(); // milik user lain

    $this->actingAs($user)->get('/orders')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Orders/Index')->has('orders.data', 2));
});

it('user dapat melihat detail dan status pesanannya', function () {
    $user = User::factory()->create();
    $order = Order::factory()->for($user)->status(OrderStatus::Diproses)->create();

    $this->actingAs($user)->get("/orders/{$order->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Orders/Show')
            ->where('order.status', 'diproses')
            ->where('order.status_label', 'Diproses')
            ->has('order.service.name'));
});

it('user tidak dapat melihat pesanan milik orang lain', function () {
    $user = User::factory()->create();
    $order = Order::factory()->create();

    $this->actingAs($user)->get("/orders/{$order->id}")->assertForbidden();
});

it('user dapat membatalkan pesanan yang masih menunggu', function () {
    $user = User::factory()->create();
    $order = Order::factory()->for($user)->create();

    $this->actingAs($user)->patch("/orders/{$order->id}/cancel")->assertRedirect();

    expect($order->fresh()->status)->toBe(OrderStatus::Dibatalkan);
});

it('user tidak dapat membatalkan pesanan yang sudah diproses', function () {
    $user = User::factory()->create();
    $order = Order::factory()->for($user)->status(OrderStatus::Diproses)->create();

    $this->actingAs($user)->patch("/orders/{$order->id}/cancel")->assertForbidden();

    expect($order->fresh()->status)->toBe(OrderStatus::Diproses);
});

it('admin tidak dapat membuat pesanan', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post('/orders', validOrderData())->assertForbidden();
});

it('halaman form pesanan menerima daftar layanan dan layanan terpilih', function () {
    $user = User::factory()->create();
    $service = Service::factory()->create();

    $this->actingAs($user)->get("/orders/create?service={$service->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Orders/Create')
            ->has('services', 1)
            ->where('selectedServiceId', $service->id));
});
