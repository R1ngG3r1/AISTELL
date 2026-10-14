<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleController extends Controller
{
    /** Kirim user ke halaman persetujuan Google. */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /** Google mengembalikan user ke sini: cari/buat akun lalu login. */
    public function callback(): RedirectResponse
    {
        try {
            $google = Socialite::driver('google')->user();
        } catch (Throwable) {
            return redirect()->route('login')->withErrors(['email' => 'Login dengan Google gagal. Silakan coba lagi.']);
        }

        if (! $google->getEmail()) {
            return redirect()->route('login')->withErrors(['email' => 'Akun Google tidak memiliki email.']);
        }

        // Cocokkan lewat google_id, lalu lewat email (menautkan akun yang sudah ada).
        $user = User::where('google_id', $google->getId())->first()
            ?? User::where('email', $google->getEmail())->first();

        if (! $user) {
            $user = new User([
                'name' => $google->getName() ?: Str::before($google->getEmail(), '@'),
                'email' => $google->getEmail(),
                'password' => Str::random(40), // tidak dipakai; login lewat Google
            ]);
            $user->email_verified_at = now();
        }

        $user->google_id = $google->getId();
        $user->email_verified_at ??= now();
        $user->save();

        Auth::login($user, remember: true);
        request()->session()->regenerate();

        return redirect()->intended(route($user->isAdmin() ? 'admin.dashboard' : 'dashboard', absolute: false));
    }
}
