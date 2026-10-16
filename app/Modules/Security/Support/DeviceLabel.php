<?php

namespace App\Modules\Security\Support;

/** Ringkasan browser dan sistem operasi dari User-Agent, mis. "Chrome di Windows". */
final class DeviceLabel
{
    public static function from(?string $userAgent): string
    {
        $ua = (string) $userAgent;

        if ($ua === '') {
            return 'Perangkat tidak dikenal';
        }

        $browser = match (true) {
            (bool) preg_match('/Edg(e|A|iOS)?\//i', $ua) => 'Edge',
            (bool) preg_match('/OPR\/|Opera/i', $ua) => 'Opera',
            (bool) preg_match('/Firefox|FxiOS/i', $ua) => 'Firefox',
            (bool) preg_match('/Chrome|CriOS/i', $ua) => 'Chrome',
            (bool) preg_match('/Safari/i', $ua) => 'Safari',
            default => 'Browser',
        };

        $os = match (true) {
            (bool) preg_match('/Android/i', $ua) => 'Android',
            (bool) preg_match('/iPhone|iPad|iPod/i', $ua) => 'iOS',
            (bool) preg_match('/Windows/i', $ua) => 'Windows',
            (bool) preg_match('/Mac OS X|Macintosh/i', $ua) => 'macOS',
            (bool) preg_match('/Linux|X11/i', $ua) => 'Linux',
            default => null,
        };

        return $os ? "{$browser} di {$os}" : $browser;
    }

    /** Sidik jari perangkat: hash User-Agent (IP sengaja tidak ikut karena sering berubah). */
    public static function fingerprint(?string $userAgent): string
    {
        return hash('sha256', (string) $userAgent);
    }
}
