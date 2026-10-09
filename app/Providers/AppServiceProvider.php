<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Jika APP_URL memakai https (production), semua URL buatan Laravel ikut https.
        if (str_starts_with((string) config('app.url'), 'https://')) {
            URL::forceScheme('https');
        }

        // Email "lupa password" dalam Bahasa Indonesia (bawaan Laravel berbahasa Inggris).
        ResetPassword::toMailUsing(function (object $notifiable, string $token) {
            $url = url(route('password.reset', [
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ], false));

            return (new MailMessage)
                ->subject('Atur Ulang Password Akun AISTEL')
                ->greeting("Halo, {$notifiable->name}!")
                ->line('Kami menerima permintaan untuk mengatur ulang password akun AISTEL Anda.')
                ->action('Atur Ulang Password', $url)
                ->line('Tautan ini berlaku selama '.config('auth.passwords.users.expire').' menit.')
                ->line('Jika Anda tidak meminta pengaturan ulang password, abaikan email ini. Password Anda tidak akan berubah.')
                ->salutation('Salam hijau, Tim AISTEL');
        });
    }
}
