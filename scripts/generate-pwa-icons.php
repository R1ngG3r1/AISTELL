<?php

/*
| Membuat ikon aplikasi (PWA) dari logo AISTEL.
| Jalankan dari folder proyek:  php scripts/generate-pwa-icons.php
|
| Hasil di public/pwa/:
|   icon-192.png, icon-512.png   → ikon biasa ("any")
|   icon-maskable-512.png        → ikon "maskable": logo di dalam zona aman 80% agar tidak terpotong
|                                  saat Android membentuknya menjadi lingkaran/squircle
|   apple-touch-icon.png (180)   → ikon "Tambahkan ke Layar Utama" di iOS
|
| Butuh ekstensi GD. Ganti LOGO di bawah bila logo berubah, lalu jalankan ulang.
*/

const LOGO = __DIR__.'/../public/landingpage/LOGO.png';
const OUT = __DIR__.'/../public/pwa';
const BACKGROUND = [0xF3, 0xF5, 0xEE]; // krem, sama dengan latar aplikasi

if (! extension_loaded('gd')) {
    fwrite(STDERR, "Ekstensi GD tidak aktif.\n");
    exit(1);
}

@mkdir(OUT, 0775, true);
$logo = imagecreatefrompng(LOGO);

/** Kanvas persegi berlatar krem dengan logo di tengah memenuhi $logoRatio dari sisi kanvas. */
function icon($logo, int $size, float $logoRatio)
{
    $canvas = imagecreatetruecolor($size, $size);
    imagefill($canvas, 0, 0, imagecolorallocate($canvas, ...BACKGROUND));
    imagealphablending($canvas, true);

    $target = (int) round($size * $logoRatio);
    $offset = (int) round(($size - $target) / 2);
    imagecopyresampled($canvas, $logo, $offset, $offset, 0, 0, $target, $target, imagesx($logo), imagesy($logo));

    return $canvas;
}

$files = [
    'icon-192.png' => [192, 0.62],
    'icon-512.png' => [512, 0.62],
    // zona aman maskable = lingkaran berdiameter 80% dari sisi, jadi logo (persegi) dibatasi ±56%
    'icon-maskable-512.png' => [512, 0.54],
    'apple-touch-icon.png' => [180, 0.62],
];

foreach ($files as $name => [$size, $ratio]) {
    $image = icon($logo, $size, $ratio);
    imagepng($image, OUT.'/'.$name, 9);
    echo "dibuat: public/pwa/{$name} ({$size}x{$size})\n";
}
