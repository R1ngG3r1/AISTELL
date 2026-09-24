<?php

use App\Models\User;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use Inertia\Testing\AssertableInertia as Assert;

it('login admin diarahkan ke dashboard admin', function () {
    $admin = User::factory()->admin()->create();

    $this->post('/login', ['email' => $admin->email, 'password' => 'password'])
        ->assertRedirect('/admin/dashboard');
});

it('dashboard user berisi ringkasan pesanan miliknya saja', function () {
    $user = User::factory()->create();
    Order::factory()->count(2)->for($user)->create();
    Order::factory()->for($user)->status(OrderStatus::Selesai)->create();
    Order::factory()->create(); // milik user lain, tidak dihitung

    $this->actingAs($user)->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->where('stats.total', 3)
            ->where('stats.menunggu', 2)
            ->where('stats.selesai', 1)
            ->where('stats.ditolak', 0)
            ->has('latestOrders', 3));
});

it('dashboard admin berisi ringkasan seluruh pesanan', function () {
    $admin = User::factory()->admin()->create();
    Order::factory()->count(4)->create();

    $this->actingAs($admin)->get('/admin/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard')
            ->where('stats.total', 4)
            ->has('latestOrders', 4));
});

it('admin yang membuka /dashboard diarahkan ke dashboard admin', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get('/dashboard')->assertRedirect('/admin/dashboard');
});

it('user biasa tidak dapat membuka dashboard admin', function () {
    $this->actingAs(User::factory()->create())->get('/admin/dashboard')->assertForbidden();
});

it('role user tidak dapat diubah lewat form profil atau register', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->patch('/profile', [
        'name' => 'Nama Baru',
        'email' => $user->email,
        'phone' => '081111111111',
        'role' => 'admin',
    ])->assertSessionHasNoErrors();

    $user->refresh();
    expect($user->role)->toBe('user')->and($user->phone)->toBe('081111111111');

    auth()->logout();
    $this->post('/register', [
        'name' => 'Penyusup',
        'email' => 'penyusup@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => 'admin',
    ]);

    expect(User::where('email', 'penyusup@example.com')->value('role'))->toBe('user');
});

it('shared props auth.user tidak mengirim password', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/dashboard')
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.user.role', 'user')
            ->missing('auth.user.password'));
});
