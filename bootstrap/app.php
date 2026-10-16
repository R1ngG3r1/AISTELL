<?php

use App\Http\Middleware\EnsureUserHasRole;
use App\Http\Middleware\HandleInertiaRequests;
use App\Modules\Security\Middleware\AdminIdleTimeout;
use App\Modules\Security\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Routing\Exceptions\InvalidSignatureException;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            // Logout admin otomatis saat tidak aktif (butuh sesi, jadi di grup web).
            AdminIdleTimeout::class,
        ]);

        // Header keamanan (CSP dll.) GLOBAL, bukan di grup web: halaman 404 untuk URL yang tidak dikenal
        // tidak melewati grup web, tetapi tetap harus diberi header.
        $middleware->append(SecurityHeaders::class);

        // Di belakang proxy / load balancer (Render, Cloudflare, Nginx, dll.) set TRUSTED_PROXIES=*
        // agar Laravel tahu request aslinya HTTPS dan IP pengunjung yang benar. Kosong = tidak ada proxy.
        $middleware->trustProxies(at: env('TRUSTED_PROXIES') ?: null);

        // Alias agar middleware role bisa dipanggil singkat: ->middleware('role:admin')
        $middleware->alias([
            'role' => EnsureUserHasRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // Tautan verifikasi email kedaluwarsa / diubah → arahkan dengan pesan yang jelas,
        // bukan halaman 403 "Invalid signature".
        $exceptions->render(function (InvalidSignatureException $e, Request $request) {
            if ($request->routeIs('verification.verify') && ! $request->expectsJson()) {
                $message = 'Tautan verifikasi sudah kedaluwarsa atau tidak valid. Masuk lalu kirim ulang email verifikasi.';

                return $request->user()
                    ? redirect()->route('verification.notice')->with('error', $message)
                    : redirect()->route('login')->with('status', $message);
            }
        });

        // Tampilkan error sebagai halaman React (resources/js/Pages/Error.tsx),
        // bukan halaman polos bawaan Laravel.
        $exceptions->respond(function (Response $response, Throwable $e, Request $request) {
            $status = $response->getStatusCode();

            // Request JSON/API tetap menerima JSON.
            if ($request->expectsJson() || $request->is('api/*')) {
                return $response;
            }

            // 419 = token CSRF kedaluwarsa (halaman dibiarkan terbuka terlalu lama).
            // Kembalikan ke halaman sebelumnya dengan pesan, bukan halaman error.
            if ($status === 419) {
                return back()->with('error', 'Sesi Anda telah berakhir. Silakan coba lagi.');
            }

            // Saat APP_DEBUG=true, error 500 tetap memakai halaman debug Laravel
            // (ada detail error & baris kode) agar mudah diperbaiki developer.
            if ($status >= 500 && config('app.debug')) {
                return $response;
            }

            if (! in_array($status, [403, 404, 500, 503], true)) {
                return $response;
            }

            return Inertia::render('Error', [
                'status' => $status,
                // Pesan dari abort(403, '...') ditulis sendiri oleh kita, jadi aman ditampilkan.
                // Pesan 404/500 bisa berisi detail internal, jadi tidak dikirim.
                'message' => $status === 403 && $e instanceof HttpExceptionInterface && $e->getMessage() !== 'This action is unauthorized.'
                    ? $e->getMessage()
                    : null,
                'homeUrl' => $request->user() ? route('dashboard') : route('home'),
            ])->toResponse($request)->setStatusCode($status);
        });
    })->create();
