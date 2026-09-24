<?php

use App\Models\User;
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
