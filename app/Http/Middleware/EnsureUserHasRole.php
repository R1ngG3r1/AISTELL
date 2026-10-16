<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * PRD 13 - Hak akses. Middleware = "penjaga pintu" yang berjalan SEBELUM controller.
 *
 * Pemakaian di route:  ->middleware(['auth', 'role:admin'])
 * Teks setelah titik dua ("admin") masuk ke parameter $role.
 * Selalu pasang 'auth' lebih dulu agar $request->user() pasti ada.
 */
class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Role tidak cocok → hentikan dengan 403 Forbidden, controller tidak dijalankan.
        abort_unless($request->user()?->role === $role, 403, 'Anda tidak memiliki akses ke halaman ini.');

        return $next($request);
    }
}
