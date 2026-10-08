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

test('akun terdaftar dengan password salah mendapat pesan password salah', function () {
    $user = User::factory()->create(['name' => 'budi']);

    // Lewat email maupun username
    foreach ([$user->email, 'budi'] as $login) {
        $this->post('/login', ['email' => $login, 'password' => 'wrong-password'])
            ->assertSessionHasErrors(['password' => 'Password yang Anda masukkan salah. Silakan coba lagi.'])
            ->assertSessionDoesntHaveErrors(['account']);
    }

    $this->assertGuest();
});

test('email atau username yang belum terdaftar mendapat pesan akun belum terdaftar', function () {
    User::factory()->create(['email' => 'ada@aistel.test', 'name' => 'budi']);

    foreach (['tidakada@aistel.test', 'siapa'] as $login) {
        $this->post('/login', ['email' => $login, 'password' => 'password'])
            ->assertSessionHasErrors(['account' => 'Akun belum terdaftar. Silakan buat akun terlebih dahulu.'])
            ->assertSessionDoesntHaveErrors(['password']);
    }

    $this->assertGuest();
});

test('email login tidak membedakan huruf besar kecil', function () {
    $user = User::factory()->create(['email' => 'budi@aistel.test']);

    $this->post('/login', ['email' => 'BUDI@Aistel.test', 'password' => 'password']);

    $this->assertAuthenticatedAs($user);
});

test('peringatan sisa percobaan muncul lalu login dikunci sementara', function () {
    $user = User::factory()->create();
    $wrong = fn () => $this->post('/login', ['email' => $user->email, 'password' => 'salah']);

    $wrong()->assertSessionHasErrors(['password' => trans('auth.password')]); // sisa 4: belum diperingatkan
    $wrong();
    $wrong();
    $wrong()->assertSessionHasErrors(['password' => trans('auth.password').' '.trans('auth.attempts_left', ['count' => 1])]);
    $wrong(); // percobaan ke-5

    // Dikunci: password benar pun ditolak sementara
    $this->post('/login', ['email' => $user->email, 'password' => 'password'])->assertSessionHasErrors('login');
    $this->assertGuest();
});

test('percobaan pada akun yang belum terdaftar juga dibatasi', function () {
    foreach (range(1, 5) as $_) {
        $this->post('/login', ['email' => 'acak@aistel.test', 'password' => 'x'])->assertSessionHasErrors('account');
    }

    $this->post('/login', ['email' => 'acak@aistel.test', 'password' => 'x'])->assertSessionHasErrors('login');
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
