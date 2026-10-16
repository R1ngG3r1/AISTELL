<?php

namespace App\Modules\Security\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Admin otomatis keluar bila tidak ada aktivitas selama `security.admin_idle_minutes`.
 * Akun admin berhak atas data semua pelanggan, jadi sesi yang ditinggalkan di komputer
 * bersama tidak boleh terbuka lama.
 */
class AdminIdleTimeout
{
    public const SESSION_KEY = 'admin_last_activity';

    public function handle(Request $request, Closure $next): Response
    {
        $limit = (int) config('security.admin_idle_minutes');
        $user = $request->user();

        if ($limit <= 0 || ! $user?->isAdmin() || ! $request->hasSession()) {
            return $next($request);
        }

        $session = $request->session();
        $last = (int) $session->get(self::SESSION_KEY, 0);

        if ($last > 0 && now()->timestamp - $last > $limit * 60) {
            Auth::logout();
            $session->invalidate();
            $session->regenerateToken();

            if ($request->expectsJson()) {
                return response()->json(['message' => 'Sesi berakhir karena tidak ada aktivitas.'], 401);
            }

            return redirect()->route('login')->with('status', "Anda keluar otomatis karena tidak ada aktivitas selama {$limit} menit. Silakan masuk lagi.");
        }

        // Polling otomatis tidak memperpanjang sesi; kalau tidak, halaman yang dibiarkan terbuka tidak akan pernah kedaluwarsa.
        if ($last === 0 || ! $this->isBackground($request)) {
            $session->put(self::SESSION_KEY, now()->timestamp);
        }

        return $next($request);
    }

    /** GET otomatis dari halaman: reload sebagian Inertia (usePoll) atau JSON (chat, notifikasi). */
    private function isBackground(Request $request): bool
    {
        return $request->isMethod('GET') && ($request->hasHeader('X-Inertia-Partial-Data') || $request->expectsJson());
    }
}
