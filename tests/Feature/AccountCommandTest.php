<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

it('membuat admin baru dengan password yang di-hash', function () {
    $this->artisan('aistel:create-admin', [
        'email' => 'budi@aistel.id', '--name' => 'Budi', '--password' => 'rahasia123',
    ])->assertSuccessful();

    $admin = User::where('email', 'budi@aistel.id')->firstOrFail();
    expect($admin->role)->toBe('admin')
        ->and(Hash::check('rahasia123', $admin->password))->toBeTrue();
});

it('membuat admin secara interaktif', function () {
    $this->artisan('aistel:create-admin')
        ->expectsQuestion('Email admin', 'siti@aistel.id')
        ->expectsQuestion('Nama admin', 'Siti')
        ->expectsQuestion('Password (minimal 8 karakter, tidak terlihat saat diketik)', 'rahasia123')
        ->assertSuccessful();

    expect(User::where('email', 'siti@aistel.id')->value('role'))->toBe('admin');
});

it('menjadikan user yang sudah ada sebagai admin', function () {
    $user = User::factory()->create();

    $this->artisan('aistel:create-admin', ['email' => $user->email])
        ->expectsConfirmation("{$user->email} sudah terdaftar sebagai user. Jadikan admin?", 'yes')
        ->assertSuccessful();

    expect($user->fresh()->role)->toBe('admin');
});

it('menolak password yang terlalu pendek', function () {
    $this->artisan('aistel:create-admin', [
        'email' => 'x@aistel.id', '--name' => 'X', '--password' => '123',
    ])->assertFailed();

    expect(User::where('email', 'x@aistel.id')->exists())->toBeFalse();
});

it('mengubah role dan melindungi admin terakhir', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();

    $this->artisan('aistel:set-role', ['email' => $admin->email, 'role' => 'user'])->assertFailed();
    expect($admin->fresh()->role)->toBe('admin');

    $this->artisan('aistel:set-role', ['email' => $user->email, 'role' => 'admin'])->assertSuccessful();
    $this->artisan('aistel:set-role', ['email' => $admin->email, 'role' => 'user'])->assertSuccessful();
    expect($admin->fresh()->role)->toBe('user');

    $this->artisan('aistel:set-role', ['email' => $user->email, 'role' => 'superadmin'])->assertFailed();
});

it('mengganti password akun', function () {
    $user = User::factory()->create();

    $this->artisan('aistel:reset-password', ['email' => $user->email, '--password' => 'passwordbaru'])
        ->assertSuccessful();

    expect(Hash::check('passwordbaru', $user->fresh()->password))->toBeTrue();
});

it('menampilkan daftar akun', function () {
    User::factory()->admin()->create(['email' => 'admin@contoh.test']);

    $this->artisan('aistel:users', ['--role' => 'admin'])
        ->expectsOutputToContain('admin@contoh.test')
        ->assertSuccessful();
});
