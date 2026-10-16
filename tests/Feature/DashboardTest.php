<?php

use App\Http\Middleware\HandleInertiaRequests;
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
        'terms' => true,
        'role' => 'admin',
    ]);

    expect(User::where('email', 'penyusup@example.com')->value('role'))->toBe('user');
});

it('dashboard user berisi jadwal terdekat dan data kalender', function () {
    $user = User::factory()->create();
    $later = Order::factory()->for($user)->create(['date' => today()->addDays(5)->toDateString()]);
    $sooner = Order::factory()->for($user)->status(OrderStatus::Diproses)->create(['date' => today()->addDay()->toDateString()]);
    Order::factory()->for($user)->status(OrderStatus::Dibatalkan)->create(['date' => today()->addDays(2)->toDateString()]);

    $this->actingAs($user)->get('/dashboard')
        ->assertInertia(fn (Assert $page) => $page
            ->has('upcomingOrders', 2)
            ->where('upcomingOrders.0.id', $sooner->id)
            ->where('upcomingOrders.1.id', $later->id)
            // pesanan dibatalkan tidak masuk kalender
            ->has('schedule', 2)
            ->where('schedule.0', ['date' => today()->addDay()->toDateString(), 'total' => 1]));
});

it('dashboard admin berisi pesanan yang perlu tindakan, terlama di atas', function () {
    $admin = User::factory()->admin()->create();
    $old = Order::factory()->create(['created_at' => now()->subDays(3)]);
    $new = Order::factory()->create(['created_at' => now()->subHour()]);
    Order::factory()->status(OrderStatus::Diproses)->create();

    $this->actingAs($admin)->get('/admin/dashboard')
        ->assertInertia(fn (Assert $page) => $page
            ->has('pendingOrders', 2)
            ->where('pendingOrders.0.id', $old->id)
            ->where('pendingOrders.1.id', $new->id)
            ->has('schedule'));
});

it('badge sidebar dan jam server dikirim ke semua halaman', function () {
    $user = User::factory()->create();
    Order::factory()->for($user)->create();
    Order::factory()->for($user)->status(OrderStatus::Diproses)->create();
    Order::factory()->for($user)->status(OrderStatus::Selesai)->create();

    $this->actingAs($user)->get('/orders')
        ->assertInertia(fn (Assert $page) => $page
            ->where('counters.activeOrders', 2)
            ->where('clock.timezone', config('app.timezone'))
            ->has('clock.now'));

    $admin = User::factory()->admin()->create();
    $this->actingAs($admin)->get('/admin/orders')
        ->assertInertia(fn (Assert $page) => $page->where('counters.pendingOrders', 1));
});

it('polling hanya mengirim prop yang diminta beserta badge & jam', function () {
    $user = User::factory()->create();
    Order::factory()->for($user)->create();

    $this->actingAs($user)
        ->get('/dashboard', [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => (string) app(HandleInertiaRequests::class)->version(request()),
            'X-Inertia-Partial-Component' => 'Dashboard',
            'X-Inertia-Partial-Data' => 'stats',
        ])
        ->assertOk()
        ->assertJsonPath('props.stats.total', 1)
        ->assertJsonPath('props.counters.activeOrders', 1)
        ->assertJsonMissingPath('props.latestOrders')
        ->assertJsonStructure(['props' => ['clock' => ['now', 'timezone']]]);
});

it('shared props auth.user tidak mengirim password', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/dashboard')
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.user.role', 'user')
            ->missing('auth.user.password'));
});
