<?php

use App\Models\User;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Service\Models\Service;
use Inertia\Testing\AssertableInertia as Assert;

/*
| Test modul Layanan. Jalankan: php artisan test --filter=ServiceTest
| Setiap test memakai database kosong (RefreshDatabase di tests/Pest.php).
*/

it('menampilkan daftar layanan di landing page', function () {
    Service::factory()->count(3)->create();

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Welcome')->has('services', 3));
});

it('user dapat melihat daftar dan detail layanan', function () {
    $user = User::factory()->create();
    $service = Service::factory()->create();

    $this->actingAs($user)->get('/services')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Services/Index')->has('services', 1));

    $this->actingAs($user)->get("/services/{$service->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('service.name', $service->name));
});

it('admin dapat menambah, mengubah, dan menghapus layanan', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post('/admin/services', ['name' => 'Cuci Karpet', 'description' => 'Karpet bersih', 'price' => 80000])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $service = Service::where('name', 'Cuci Karpet')->firstOrFail();

    $this->actingAs($admin)
        ->put("/admin/services/{$service->id}", ['name' => 'Cuci Karpet Besar', 'price' => 120000])
        ->assertSessionHasNoErrors();

    expect($service->fresh()->name)->toBe('Cuci Karpet Besar')
        ->and($service->fresh()->price)->toBe('120000.00');

    $this->actingAs($admin)->delete("/admin/services/{$service->id}")->assertRedirect();

    expect(Service::find($service->id))->toBeNull();
});

it('memvalidasi input layanan', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post('/admin/services', ['name' => '', 'price' => -1])
        ->assertSessionHasErrors(['name', 'price']);
});

it('nama layanan harus unik, kecuali saat mengubah layanan itu sendiri', function () {
    $admin = User::factory()->admin()->create();
    $service = Service::factory()->create(['name' => 'Bersih Rumah']);

    $this->actingAs($admin)
        ->post('/admin/services', ['name' => 'Bersih Rumah', 'price' => 100000])
        ->assertSessionHasErrors(['name' => 'Layanan dengan nama ini sudah ada.']);

    $this->actingAs($admin)
        ->put("/admin/services/{$service->id}", ['name' => 'Bersih Rumah', 'price' => 175000])
        ->assertSessionHasNoErrors();

    expect($service->fresh()->price)->toBe('175000.00');
});

it('tidak menghapus layanan yang masih memiliki pesanan aktif', function (OrderStatus $status) {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->status($status)->create();

    $this->actingAs($admin)
        ->delete("/admin/services/{$order->service_id}")
        ->assertSessionHas('error');

    expect(Service::find($order->service_id))->not->toBeNull();
})->with([OrderStatus::Menunggu, OrderStatus::Diproses]);

it('dapat menghapus layanan jika pesanan terkait sudah tidak aktif', function (OrderStatus $status) {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->status($status)->create();
    $serviceId = $order->service_id;
    $serviceName = $order->service->name;

    $this->actingAs($admin)
        ->delete("/admin/services/{$serviceId}")
        ->assertSessionHasNoErrors()
        ->assertSessionHas('success')
        ->assertRedirect();

    // Layanan tidak lagi ditemukan dalam pencarian normal
    expect(Service::find($serviceId))->toBeNull();

    // Namun tetap tersimpan di database (soft delete) untuk menjaga integritas riwayat pesanan
    expect(Service::withTrashed()->find($serviceId))->not->toBeNull();

    // Pesanan lama tetap dapat mengakses detail nama layanannya
    expect($order->fresh()->service->name)->toBe($serviceName);
})->with([OrderStatus::Selesai, OrderStatus::Ditolak, OrderStatus::Dibatalkan]);

it('halaman kelola layanan admin menyertakan active_orders_count', function () {
    $admin = User::factory()->admin()->create();
    $service = Service::factory()->create();

    // Buat 1 pesanan aktif (menunggu) dan 1 pesanan selesai
    Order::factory()->for($service)->status(OrderStatus::Menunggu)->create();
    Order::factory()->for($service)->status(OrderStatus::Selesai)->create();

    $this->actingAs($admin)
        ->get('/admin/services')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Services/Index')
            ->where('services.0.orders_count', 2)
            ->where('services.0.active_orders_count', 1)
        );
});

it('user biasa tidak dapat mengelola layanan', function () {
    $user = User::factory()->create();
    $service = Service::factory()->create();

    $this->actingAs($user)->get('/admin/services')->assertForbidden();
    $this->actingAs($user)->post('/admin/services', ['name' => 'X', 'price' => 1])->assertForbidden();
    $this->actingAs($user)->delete("/admin/services/{$service->id}")->assertForbidden();
});

it('tamu diarahkan ke login saat membuka halaman layanan', function () {
    $this->get('/services')->assertRedirect('/login');
});
