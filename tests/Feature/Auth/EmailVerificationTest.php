<?php

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;

test('email verification screen can be rendered', function () {
    $user = User::factory()->unverified()->create();

    $response = $this->actingAs($user)->get('/verify-email');

    $response->assertStatus(200);
});

test('email can be verified', function () {
    $user = User::factory()->unverified()->create();

    Event::fake();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)]
    );

    $response = $this->actingAs($user)->get($verificationUrl);

    Event::assertDispatched(Verified::class);
    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
    $response->assertRedirect(route('dashboard', absolute: false).'?verified=1');
});

test('email is not verified with invalid hash', function () {
    $user = User::factory()->unverified()->create();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1('wrong-email')]
    );

    $this->actingAs($user)->get($verificationUrl);

    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});

function verificationUrl(User $user, $expires = null, ?string $hash = null): string
{
    return URL::temporarySignedRoute(
        'verification.verify',
        $expires ?? now()->addMinutes(60),
        ['id' => $user->id, 'hash' => $hash ?? sha1($user->email)]
    );
}

test('tautan dibuka di perangkat lain yang belum login tetap memverifikasi akun', function () {
    $user = User::factory()->unverified()->create();

    $this->get(verificationUrl($user))
        ->assertRedirect(route('login'))
        ->assertSessionHas('status', 'Email berhasil diverifikasi. Silakan masuk.');

    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
    $this->assertGuest();
});

test('tautan dibuka di perangkat yang login sebagai akun lain memverifikasi pemilik tanpa mengganti sesi', function () {
    $user = User::factory()->unverified()->create();
    $other = User::factory()->create();

    $this->actingAs($other)->get(verificationUrl($user))->assertRedirect(route('dashboard'));

    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
    $this->assertAuthenticatedAs($other);
});

test('admin yang login diarahkan ke dashboard admin setelah verifikasi', function () {
    $admin = User::factory()->admin()->unverified()->create();

    $this->actingAs($admin)->get(verificationUrl($admin))->assertRedirect('/admin/dashboard?verified=1');
});

test('tautan dengan hash salah ditolak dengan pesan, bukan 403', function () {
    $user = User::factory()->unverified()->create();

    $this->get(verificationUrl($user, hash: sha1('email-lain')))
        ->assertRedirect(route('login'))
        ->assertSessionHas('status');

    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});

test('tautan kedaluwarsa atau diubah mengarahkan ke login dengan pesan, bukan 403', function () {
    $user = User::factory()->unverified()->create();

    $this->get(verificationUrl($user, now()->subMinute()))
        ->assertRedirect(route('login'))
        ->assertSessionHas('status');

    $this->get(verificationUrl($user).'x')->assertRedirect(route('login'));

    $this->actingAs($user)->get(verificationUrl($user, now()->subMinute()))
        ->assertRedirect(route('verification.notice'))
        ->assertSessionHas('error');

    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});

test('tautan untuk akun yang tidak ada tidak menyebabkan error', function () {
    $this->get(URL::temporarySignedRoute('verification.verify', now()->addHour(), ['id' => 99999, 'hash' => sha1('x')]))
        ->assertRedirect(route('login'));
});

test('halaman verifikasi langsung lanjut ke dashboard jika akun sudah terverifikasi di perangkat lain', function () {
    $user = User::factory()->unverified()->create();
    $this->actingAs($user)->get('/verify-email')->assertOk();

    $user->markEmailAsVerified();

    $this->actingAs($user->fresh())->get('/verify-email')->assertRedirect(route('dashboard'));
});
