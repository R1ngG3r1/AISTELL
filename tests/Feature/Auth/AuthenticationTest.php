<?php

use App\Models\User;

test('login screen can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('users can authenticate using their username', function () {
    $user = User::factory()->create(['name' => 'budi']);

    $this->post('/login', ['email' => 'budi', 'password' => 'password']);

    $this->assertAuthenticatedAs($user);
});

test('username login is refused when the name is used by more than one account', function () {
    User::factory()->count(2)->create(['name' => 'budi']);

    $this->post('/login', ['email' => 'budi', 'password' => 'password'])
        ->assertSessionHasErrors(['email' => trans('auth.ambiguous')]);

    $this->assertGuest();
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ])->assertSessionHasErrors(['email' => 'Username/email atau password yang Anda masukkan salah.']);

    $this->assertGuest();
});

test('admin is not sent back to a user-only page after login', function () {
    $admin = User::factory()->admin()->create();

    // Tamu membuka /orders → diarahkan ke login dan URL-nya diingat (url.intended)
    $this->get('/orders')->assertRedirect('/login');

    $this->post('/login', ['email' => $admin->email, 'password' => 'password'])
        ->assertRedirect('/admin/dashboard');
});

test('users are sent back to the page they wanted after login', function () {
    $user = User::factory()->create();

    $this->get('/orders')->assertRedirect('/login');

    $this->post('/login', ['email' => $user->email, 'password' => 'password'])
        ->assertRedirect('/orders');
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});
