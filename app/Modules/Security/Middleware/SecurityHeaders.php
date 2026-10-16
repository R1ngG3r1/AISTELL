<?php

namespace App\Modules\Security\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

/**
 * Header keamanan untuk semua respons web.
 *
 * CSP memakai nonce per request: skrip inline (Ziggy `@routes` dan skrip Vite) hanya jalan bila
 * membawa nonce yang benar, jadi skrip suntikan dari pihak lain tidak bisa dieksekusi.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $nonce = base64_encode(random_bytes(16));
        Vite::useCspNonce($nonce); // tag <script>/<link> dari @vite otomatis memakai nonce ini

        /** @var Response $response */
        $response = $next($request);

        $headers = [
            'X-Content-Type-Options' => 'nosniff',
            'X-Frame-Options' => 'DENY',
            'Referrer-Policy' => 'strict-origin-when-cross-origin',
            // Hanya lokasi (untuk "gunakan lokasi saya" di peta) yang dipakai aplikasi.
            'Permissions-Policy' => 'camera=(), microphone=(), payment=(), usb=(), geolocation=(self)',
            'Cross-Origin-Opener-Policy' => 'same-origin',
        ];

        if (config('security.hsts.enabled') && app()->isProduction() && $request->isSecure()) {
            $headers['Strict-Transport-Security'] = 'max-age='.(int) config('security.hsts.max_age');
        }

        foreach ($headers as $name => $value) {
            $response->headers->set($name, $value);
        }

        if ($this->shouldSendCsp($response)) {
            $name = config('security.csp.report_only') ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
            $response->headers->set($name, $this->policy($nonce, $request));
        }

        return $response;
    }

    /** Halaman debug Laravel (Ignition) memakai skrip inline tanpa nonce, jadi tidak diberi CSP. */
    private function shouldSendCsp(Response $response): bool
    {
        if (! config('security.csp.enabled')) {
            return false;
        }

        return ! (config('app.debug') && $response->getStatusCode() >= 500);
    }

    public function policy(string $nonce, Request $request): string
    {
        $dev = $this->devServer();

        $script = ["'self'", "'nonce-{$nonce}'"];
        // Style inline dibutuhkan FontAwesome (menyuntik <style> saat runtime) dan beberapa komponen.
        $style = ["'self'", "'unsafe-inline'", 'https://fonts.bunny.net'];
        $font = ["'self'", 'data:', 'https://fonts.bunny.net'];
        // Tile peta OpenStreetMap; blob:/data: untuk pratinjau lampiran dan kode QR.
        $img = ["'self'", 'data:', 'blob:', 'https://tile.openstreetmap.org'];
        // Nominatim: pencarian alamat di peta.
        $connect = ["'self'", 'https://nominatim.openstreetmap.org'];

        if ($dev) {
            // Server Vite saat `npm run dev` (HMR lewat WebSocket). Alamat IPv6 seperti http://[::1]:5173
            // tidak sah sebagai sumber CSP, jadi untuk itu dipakai skema http:/ws: (hanya di mode dev).
            $isIpv6 = str_contains($dev, '[');
            $http = $isIpv6 ? 'http:' : $dev;
            $ws = $isIpv6 ? 'ws:' : preg_replace('#^http#', 'ws', $dev);
            array_push($script, $http);
            array_push($style, $http);
            array_push($font, $http);
            array_push($img, $http);
            array_push($connect, $http, $ws);
        }

        $directives = [
            'default-src' => ["'self'"],
            'script-src' => $script,
            'style-src' => $style,
            'font-src' => $font,
            'img-src' => $img,
            'connect-src' => $connect,
            'object-src' => ["'none'"],
            'base-uri' => ["'self'"],
            'form-action' => ["'self'"],
            'frame-ancestors' => ["'none'"],
        ];

        $policy = collect($directives)->map(fn (array $sources, string $name) => $name.' '.implode(' ', $sources))->implode('; ');

        return $request->isSecure() && app()->isProduction() ? $policy.'; upgrade-insecure-requests' : $policy;
    }

    /** Alamat server Vite bila sedang `npm run dev` (isi public/hot), selain itu null. */
    private function devServer(): ?string
    {
        if (! Vite::isRunningHot()) {
            return null;
        }

        $url = trim((string) @file_get_contents(public_path('hot')));

        return $url !== '' ? rtrim($url, '/') : null;
    }
}
