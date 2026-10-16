<?php

use App\Models\User;
use App\Modules\Order\Models\Order;
use Inertia\Testing\AssertableInertia as Assert;

it('menampilkan halaman Error untuk 404', function () {
    $this->get('/halaman-yang-tidak-ada')
        ->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Error')
            ->where('status', 404)
            ->where('message', null));
});

it('menampilkan halaman Error beserta pesan untuk 403', function () {
    $this->actingAs(User::factory()->create())
        ->get('/admin/orders')
        ->assertForbidden()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Error')
            ->where('status', 403)
            ->where('message', 'Anda tidak memiliki akses ke halaman ini.')
            ->where('homeUrl', route('dashboard')));
});

it('tetap mengembalikan JSON untuk request yang meminta JSON', function () {
    $this->getJson('/halaman-yang-tidak-ada')
        ->assertNotFound()
        ->assertJsonStructure(['message']);
});

it('pesan 403 bawaan Laravel (bahasa Inggris) tidak ditampilkan, diganti teks halaman', function () {
    $order = Order::factory()->create();

    $this->actingAs(User::factory()->create())
        ->get("/orders/{$order->id}")
        ->assertForbidden()
        ->assertInertia(fn (Assert $page) => $page->component('Error')->where('status', 403)->where('message', null));
});

it('tamu yang membuka halaman tidak ada tetap mendapat halaman 404 tanpa error', function () {
    $this->get('/tidak-ada/sama-sekali')
        ->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page->component('Error')->where('homeUrl', route('home')));
});
