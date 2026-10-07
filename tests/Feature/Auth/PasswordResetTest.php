<?php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Notification;

test('reset password link screen can be rendered', function () {
    $response = $this->get('/forgot-password');

    $response->assertStatus(200);
});

test('reset password link can be requested', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post('/forgot-password', ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class);
});

test('reset password email is written in Indonesian', function () {
    Notification::fake();

    $user = User::factory()->create(['name' => 'Budi']);

    $this->post('/forgot-password', ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
        $mail = $notification->toMail($user);

        return $mail->subject === 'Atur Ulang Password Akun AISTEL'
            && $mail->greeting === 'Halo, Budi!'
            && $mail->actionText === 'Atur Ulang Password'
            && str_contains($mail->actionUrl, '/reset-password/'.$notification->token);
    });
});

test('forgot password does not reveal whether an email is registered', function () {
    Notification::fake();
    $user = User::factory()->create();

    $registered = $this->post('/forgot-password', ['email' => $user->email]);
    $unknown = $this->post('/forgot-password', ['email' => 'tidak-ada@example.com']);

    $registered->assertSessionHasNoErrors()->assertSessionHas('status', __('passwords.sent'));
    $unknown->assertSessionHasNoErrors()->assertSessionHas('status', __('passwords.sent'));
    Notification::assertSentTimes(ResetPassword::class, 1);
});

test('reset password screen can be rendered', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post('/forgot-password', ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) {
        $response = $this->get('/reset-password/'.$notification->token);

        $response->assertStatus(200);

        return true;
    });
});

test('password can be reset with valid token', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post('/forgot-password', ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
        $response = $this->post('/reset-password', [
            'token' => $notification->token,
            'email' => $user->email,
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('login'));

        return true;
    });
});
