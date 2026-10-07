<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Arahkan ke dashboard sesuai role. Kalau sebelumnya user mencoba membuka
        // halaman tertentu lalu disuruh login, kembalikan ke sana — asalkan role-nya
        // boleh membuka halaman itu (mis. admin tidak dikirim ke /orders lalu kena 403).
        $user = $request->user();
        $home = route($user->isAdmin() ? 'admin.dashboard' : 'dashboard', absolute: false);
        $intended = $request->session()->pull('url.intended');

        return redirect()->to($this->roleCanVisit($user, $intended) ? $intended : $home);
    }

    /** true jika URL ada dan tidak dijaga middleware role lain (role:admin / role:user). */
    private function roleCanVisit(User $user, ?string $url): bool
    {
        if (! $url) {
            return false;
        }

        try {
            $route = app('router')->getRoutes()->match(Request::create($url));
        } catch (Throwable) {
            return false;
        }

        $roles = collect($route->gatherMiddleware())
            ->filter(fn ($m) => is_string($m) && str_starts_with($m, 'role:'))
            ->map(fn (string $m) => substr($m, 5));

        return $roles->isEmpty() || $roles->contains($user->role);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
