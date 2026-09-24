<?php

use App\Http\Middleware\EnsureUserHasRole;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
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
        ]);

        // Alias agar middleware role bisa dipanggil singkat: ->middleware('role:admin')
        $middleware->alias([
            'role' => EnsureUserHasRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

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
                'message' => $status === 403 && $e instanceof HttpExceptionInterface ? $e->getMessage() : null,
                'homeUrl' => $request->user() ? route('dashboard') : route('home'),
            ])->toResponse($request)->setStatusCode($status);
        });
    })->create();
