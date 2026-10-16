<?php

/*
| PWA (bisa dipasang di layar utama): manifest, ikon, halaman offline, dan tag di halaman.
| Jalankan: php artisan test --filter=PwaTest
*/

function manifest(): array
{
    return json_decode(file_get_contents(public_path('manifest.webmanifest')), true, flags: JSON_THROW_ON_ERROR);
}

it('manifest berisi syarat minimal agar bisa dipasang', function () {
    $m = manifest();

    expect($m['name'])->not->toBeEmpty()
        ->and($m['short_name'])->toBe('AISTEL')
        ->and($m['short_name'])->toHaveLength(6) // singkat agar muat di bawah ikon
        ->and($m['display'])->toBe('standalone')
        ->and($m['lang'])->toBe('id')
        ->and($m['scope'])->toBe('/')
        ->and($m['theme_color'])->toMatch('/^#[0-9a-f]{6}$/i')
        ->and($m['background_color'])->toMatch('/^#[0-9a-f]{6}$/i');
});

it('halaman awal berada di dalam scope dan mengarah ke dashboard', function () {
    $m = manifest();

    expect($m['start_url'])->toStartWith('/dashboard')
        ->and($m['start_url'])->toStartWith($m['scope']);
});

it('ikon tersedia dengan ukuran persis seperti yang dideklarasikan, termasuk versi maskable', function () {
    $icons = collect(manifest()['icons']);

    expect($icons->pluck('purpose')->all())->toContain('any', 'maskable');

    foreach ($icons as $icon) {
        $path = public_path(ltrim($icon['src'], '/'));
        expect(file_exists($path))->toBeTrue("Ikon {$icon['src']} tidak ada");

        [$w, $h, $type] = getimagesize($path);
        expect("{$w}x{$h}")->toBe($icon['sizes'])
            ->and(image_type_to_mime_type($type))->toBe($icon['type']);
    }

    // Chrome mensyaratkan minimal 192px dan 512px
    expect($icons->pluck('sizes')->all())->toContain('192x192', '512x512');
});

it('ikon Apple (iOS) berukuran 180x180', function () {
    [$w, $h] = getimagesize(public_path('pwa/apple-touch-icon.png'));

    expect([$w, $h])->toBe([180, 180]);
});

it('ikon maskable memberi ruang aman di sekeliling logo (bagian tepi hanya warna latar)', function () {
    $image = imagecreatefrompng(public_path('pwa/icon-maskable-512.png'));
    $corner = imagecolorat($image, 5, 5);
    $edgeMid = imagecolorat($image, 256, 20);
    $center = imagecolorat($image, 200, 200);

    // tepi atas dan sudut = warna latar yang sama; logo hanya di tengah
    expect($edgeMid)->toBe($corner)->and($center)->not->toBe($corner);
});

it('halaman web memasang tag manifest, warna tema, dan ikon Apple', function () {
    $this->get('/')
        ->assertOk()
        ->assertSee('<link rel="manifest" href="/manifest.webmanifest">', false)
        ->assertSee('<meta name="theme-color" content="'.manifest()['theme_color'].'">', false)
        ->assertSee('<link rel="apple-touch-icon" href="/pwa/apple-touch-icon.png">', false)
        ->assertSee('apple-mobile-web-app-capable', false);
});

it('warna tema pada halaman sama dengan manifest', function () {
    $html = $this->get('/')->getContent();

    preg_match('/<meta name="theme-color" content="([^"]+)"/', $html, $m);

    expect($m[1])->toBe(manifest()['theme_color']);
});

it('halaman offline tersedia dan memuat petunjuk yang jelas', function () {
    $html = file_get_contents(public_path('offline.html'));

    expect($html)->toContain('lang="id"')
        ->toContain('Anda sedang offline')
        ->toContain('Coba lagi')
        ->toContain('name="viewport"');
});

it('halaman offline tidak memuat sumber dari luar sehingga tetap tampil tanpa internet', function () {
    $html = file_get_contents(public_path('offline.html'));

    preg_match_all('/(?:src|href)="([^"]+)"/', $html, $m);

    foreach ($m[1] as $ref) {
        expect($ref)->toStartWith('/')->not->toStartWith('//');
        expect(file_exists(public_path(ltrim($ref, '/'))))->toBeTrue("{$ref} tidak ada");
    }
});

it('service worker ada, dan CSP mengizinkan pemuatannya dari origin sendiri', function () {
    expect(file_exists(public_path('sw.js')))->toBeTrue();

    $csp = $this->get('/')->headers->get('Content-Security-Policy');

    // worker-src jatuh ke script-src ('self'), dan manifest-src ke default-src ('self')
    expect($csp)->toContain("default-src 'self'")->toContain("script-src 'self'")->not->toContain('worker-src');
});
