<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class VerifyEmailController extends Controller
{
    /**
     * Verifikasi email dari tautan di email. Tidak butuh login: tautan sering dibuka di
     * perangkat lain daripada tempat mendaftar. Tanda tangan URL (middleware `signed`) dan
     * hash email memastikan hanya pemilik email yang bisa memverifikasi akunnya.
     */
    public function __invoke(int $id, string $hash): RedirectResponse
    {
        $user = User::find($id);

        if (! $user || ! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return redirect()->route('login')->with('status', 'Tautan verifikasi tidak valid. Silakan masuk lalu kirim ulang email verifikasi.');
        }

        if (! $user->hasVerifiedEmail() && $user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        // Pemilik akun sedang login di perangkat ini → langsung lanjut ke dashboard.
        if (Auth::id() === $user->id) {
            return redirect()->intended(route($user->isAdmin() ? 'admin.dashboard' : 'dashboard', absolute: false).'?verified=1');
        }

        // Dibuka di perangkat lain (belum login, atau login sebagai akun berbeda): akun tetap
        // terverifikasi, tapi sesi di sini tidak diganti. Pemilik tinggal masuk.
        $message = 'Email berhasil diverifikasi. Silakan masuk.';

        return Auth::check()
            ? redirect()->route($this->homeRoute())->with('success', "Email {$user->email} berhasil diverifikasi. Pemiliknya kini dapat masuk.")
            : redirect()->route('login')->with('status', $message);
    }

    private function homeRoute(): string
    {
        return Auth::user()->isAdmin() ? 'admin.dashboard' : 'dashboard';
    }
}
