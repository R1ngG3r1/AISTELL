<?php

return [

    /*
    | Content-Security-Policy: browser hanya boleh memuat skrip, gambar, dan koneksi dari sumber
    | yang terdaftar (lihat SecurityHeaders). Ini lapisan terakhir bila ada celah XSS.
    |
    | SECURITY_CSP=false          → matikan sepenuhnya.
    | SECURITY_CSP_REPORT_ONLY=true → hanya melaporkan pelanggaran di konsol browser, tidak memblokir.
    |                                 Pakai ini saat pertama kali menyalakan di server produksi.
    */
    'csp' => [
        'enabled' => (bool) env('SECURITY_CSP', true),
        'report_only' => (bool) env('SECURITY_CSP_REPORT_ONLY', false),
    ],

    /*
    | HSTS (paksa HTTPS di browser). Hanya dikirim pada request HTTPS di environment production.
    | Jangan nyalakan bila situs belum seluruhnya melayani HTTPS.
    */
    'hsts' => [
        'enabled' => (bool) env('SECURITY_HSTS', true),
        'max_age' => (int) env('SECURITY_HSTS_MAX_AGE', 15552000), // 180 hari
    ],

    /*
    | Admin otomatis keluar setelah sekian menit tanpa aktivitas (0 = nonaktif).
    | Polling otomatis di latar belakang (badge, chat) TIDAK dihitung sebagai aktivitas.
    */
    'admin_idle_minutes' => (int) env('ADMIN_IDLE_MINUTES', 30),

    /*
    | Kirim email + notifikasi bila akun admin masuk dari browser/perangkat yang belum dikenal.
    */
    'notify_new_admin_device' => (bool) env('SECURITY_NOTIFY_NEW_ADMIN_DEVICE', true),

];
