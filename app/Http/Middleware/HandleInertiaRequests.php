<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Data di sini otomatis dikirim ke SEMUA halaman React (usePage().props).
        return [
            ...parent::share($request),
            'auth' => [
                // Kirim kolom yang dibutuhkan FE saja. `role` dipakai FE untuk
                // menampilkan menu User/Admin; password tidak pernah dikirim.
                'user' => $request->user()?->only([
                    'id', 'name', 'email', 'phone', 'role', 'email_verified_at',
                ]),
            ],
            // Pesan singkat setelah aksi, contoh: redirect()->with('success', 'Pesanan dibuat').
            // Pakai fn() supaya hanya dibaca ketika halaman benar-benar dirender.
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
