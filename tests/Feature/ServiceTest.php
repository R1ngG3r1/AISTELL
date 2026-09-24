<?php

use App\Models\User;
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

it('tidak menghapus layanan yang sudah pernah dipesan', function () {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->create();

    $this->actingAs($admin)
        ->delete("/admin/services/{$order->service_id}")
        ->assertSessionHas('error');

    expect(Service::find($order->service_id))->not->toBeNull();
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
