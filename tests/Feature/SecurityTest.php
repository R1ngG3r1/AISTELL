<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\User;
use App\Modules\Notification\Notifications\AdminNewDeviceNotification;
use App\Modules\Security\Models\AdminDevice;
use App\Modules\Security\Support\DeviceLabel;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Route;

/*
| Keamanan: header (CSP dll.), logout admin saat tidak aktif, dan pemberitahuan login dari perangkat baru.
| Jalankan: php artisan test --filter=SecurityTest
*/

const CHROME_WIN = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const SAFARI_IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

// ---------- Header keamanan ----------

it('semua halaman web mendapat header keamanan dasar', function () {
    $this->get('/')
        ->assertOk()
        ->assertHeader('X-Frame-Options', 'DENY')
        ->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
        ->assertHeader('Cross-Origin-Opener-Policy', 'same-origin')
        ->assertHeader('Permissions-Policy', 'camera=(), microphone=(), payment=(), usb=(), geolocation=(self)');
});

it('CSP memakai nonce yang sama dengan skrip inline di halaman, dan berganti di tiap request', function () {
    $first = $this->get('/');
    $csp = $first->headers->get('Content-Security-Policy');

    preg_match("/'nonce-([^']+)'/", $csp, $m);
    expect($m)->not->toBeEmpty();
    $first->assertSee('nonce="'.$m[1].'"', false);

    $second = $this->get('/')->headers->get('Content-Security-Policy');
    expect($second)->not->toBe($csp);
});

it('CSP membatasi sumber ke domain yang memang dipakai aplikasi', function () {
    $csp = $this->get('/')->headers->get('Content-Security-Policy');

    expect($csp)
        ->toContain("default-src 'self'")
        ->toContain("object-src 'none'")
        ->toContain("base-uri 'self'")
        ->toContain("form-action 'self'")
        ->toContain("frame-ancestors 'none'")
        ->toContain('https://tile.openstreetmap.org')
        ->toContain('https://nominatim.openstreetmap.org')
        ->toContain('https://fonts.bunny.net')
        ->not->toContain("script-src 'self' 'unsafe-inline'")
        ->not->toContain("'unsafe-eval'");

    // skrip hanya dari 'self' dan nonce (di mode dev ditambah server Vite)
    preg_match('/script-src ([^;]+)/', $csp, $m);
    expect($m[1])->toContain("'self'")->toContain("'nonce-")->not->toContain('unsafe-inline');
});

it('CSP bisa dimatikan atau dijadikan mode lapor saja lewat konfigurasi', function () {
    config(['security.csp.enabled' => false]);
    expect($this->get('/')->headers->has('Content-Security-Policy'))->toBeFalse();

    config(['security.csp.enabled' => true, 'security.csp.report_only' => true]);
    $response = $this->get('/');
    expect($response->headers->has('Content-Security-Policy'))->toBeFalse()
        ->and($response->headers->has('Content-Security-Policy-Report-Only'))->toBeTrue();
});

it('HSTS hanya dikirim di production lewat HTTPS', function () {
    $this->get('/')->assertHeaderMissing('Strict-Transport-Security');

    $this->app['env'] = 'production';
    $this->get('https://localhost/')->assertHeader('Strict-Transport-Security', 'max-age=15552000');
    $this->get('http://localhost/')->assertHeaderMissing('Strict-Transport-Security');

    config(['security.hsts.enabled' => false]);
    $this->get('https://localhost/')->assertHeaderMissing('Strict-Transport-Security');
});

it('halaman debug error 500 tidak diberi CSP agar tetap terbaca, error biasa tetap mendapat header', function () {
    Route::get('/_boom', fn () => abort(500))->middleware('web');

    config(['app.debug' => true]);
    $this->get('/_boom')->assertStatus(500)->assertHeaderMissing('Content-Security-Policy');

    config(['app.debug' => false]);
    $this->get('/_boom')->assertStatus(500)->assertHeader('Content-Security-Policy')->assertHeader('X-Frame-Options', 'DENY');

    $this->get('/tidak-ada-halaman-ini')->assertNotFound()->assertHeader('Content-Security-Policy');
});

it('respons JSON dan unduhan juga mendapat header keamanan', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->getJson('/notifications')->assertOk()->assertHeader('X-Content-Type-Options', 'nosniff');
});

// ---------- Logout admin saat tidak aktif ----------

it('admin keluar otomatis setelah melewati batas tidak aktif', function () {
    config(['security.admin_idle_minutes' => 30]);
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get('/admin/dashboard')->assertOk();

    $this->travel(31)->minutes();
    $this->get('/admin/dashboard')
        ->assertRedirect('/login')
        ->assertSessionHas('status');

    $this->assertGuest();
});

it('aktivitas sungguhan memperpanjang sesi admin', function () {
    config(['security.admin_idle_minutes' => 30]);
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get('/admin/dashboard')->assertOk();
    $this->travel(20)->minutes();
    $this->get('/admin/orders')->assertOk(); // aktivitas → hitungan mulai lagi
    $this->travel(20)->minutes();
    $this->get('/admin/orders')->assertOk(); // 40 menit sejak awal, tetapi hanya 20 sejak aktivitas terakhir

    $this->assertAuthenticatedAs($admin);
});

it('polling otomatis tidak memperpanjang sesi admin', function () {
    config(['security.admin_idle_minutes' => 30]);
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get('/admin/dashboard')->assertOk();

    $this->travel(20)->minutes();
    // reload sebagian Inertia (usePoll) dan JSON (chat/notifikasi) = latar belakang
    $this->withHeaders([
        'X-Inertia' => 'true',
        'X-Inertia-Version' => (string) app(HandleInertiaRequests::class)->version(request()),
        'X-Inertia-Partial-Component' => 'Admin/Dashboard',
        'X-Inertia-Partial-Data' => 'counters',
    ])->get('/admin/dashboard')->assertSuccessful();
    $this->getJson('/notifications')->assertOk();

    $this->travel(20)->minutes(); // 40 menit sejak aktivitas sungguhan terakhir
    $this->get('/admin/dashboard')->assertRedirect('/login');
});

it('permintaan JSON setelah kedaluwarsa mendapat 401, bukan redirect', function () {
    config(['security.admin_idle_minutes' => 30]);
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get('/admin/dashboard');
    $this->travel(31)->minutes();

    $this->getJson('/notifications')->assertUnauthorized();
});

it('user biasa tidak terkena batas tidak aktif admin', function () {
    config(['security.admin_idle_minutes' => 30]);
    $user = User::factory()->create();

    $this->actingAs($user)->get('/dashboard')->assertOk();
    $this->travel(5)->hours();

    $this->get('/dashboard')->assertOk();
    $this->assertAuthenticatedAs($user);
});

it('batas tidak aktif nol berarti dinonaktifkan', function () {
    config(['security.admin_idle_minutes' => 0]);
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get('/admin/dashboard')->assertOk();
    $this->travel(10)->hours();

    $this->get('/admin/dashboard')->assertOk();
});

// ---------- Login admin dari perangkat baru ----------

function loginAs(User $user, string $agent): void
{
    test()->withHeader('User-Agent', $agent)->post('/login', ['email' => $user->email, 'password' => 'password'])->assertSessionHasNoErrors();
}

it('login admin pertama hanya mencatat perangkat tanpa pemberitahuan', function () {
    Notification::fake();
    $admin = User::factory()->admin()->create();

    loginAs($admin, CHROME_WIN);

    Notification::assertNothingSent();
    expect(AdminDevice::where('user_id', $admin->id)->sole()->label)->toBe('Chrome di Windows');
});

it('login dari perangkat yang sama tidak memicu pemberitahuan', function () {
    Notification::fake();
    $admin = User::factory()->admin()->create();

    loginAs($admin, CHROME_WIN);
    $this->post('/logout');
    loginAs($admin, CHROME_WIN);

    Notification::assertNothingSent();
    expect(AdminDevice::where('user_id', $admin->id)->count())->toBe(1);
});

it('login dari perangkat baru memberi tahu admin lewat email dan lonceng', function () {
    Notification::fake();
    $admin = User::factory()->admin()->create();

    loginAs($admin, CHROME_WIN);
    $this->post('/logout');
    loginAs($admin, SAFARI_IPHONE);

    Notification::assertSentTo($admin, AdminNewDeviceNotification::class, fn ($n, $channels) => $channels === ['database', 'mail']);
    expect(AdminDevice::where('user_id', $admin->id)->pluck('label')->sort()->values()->all())->toBe(['Chrome di Windows', 'Safari di iOS']);
});

it('isi pemberitahuan menyebut perangkat, IP, dan ajakan ganti password', function () {
    $admin = User::factory()->admin()->create();

    loginAs($admin, CHROME_WIN);
    $this->post('/logout');
    loginAs($admin, SAFARI_IPHONE);

    $data = $admin->notifications()->where('type', AdminNewDeviceNotification::class)->sole()->data;

    expect($data['kind'])->toBe('security')
        ->and($data['title'])->toBe('Login baru ke akun admin')
        ->and($data['body'])->toContain('Safari di iOS')->toContain('IP ')->toContain('ganti password')
        ->and($data['url'])->toBe('/profile');
});

it('pemberitahuan perangkat baru bisa dimatikan lewat konfigurasi', function () {
    config(['security.notify_new_admin_device' => false]);
    Notification::fake();
    $admin = User::factory()->admin()->create();

    loginAs($admin, CHROME_WIN);
    $this->post('/logout');
    loginAs($admin, SAFARI_IPHONE);

    Notification::assertNothingSent();
});

it('user biasa tidak dicatat perangkatnya dan tidak memicu pemberitahuan', function () {
    Notification::fake();
    $user = User::factory()->create();

    loginAs($user, CHROME_WIN);
    $this->post('/logout');
    loginAs($user, SAFARI_IPHONE);

    Notification::assertNothingSent();
    expect(AdminDevice::count())->toBe(0);
});

it('perangkat dicatat per admin, dan ikut terhapus saat akun dihapus', function () {
    $a = User::factory()->admin()->create();
    $b = User::factory()->admin()->create();

    loginAs($a, CHROME_WIN);
    $this->post('/logout');
    loginAs($b, CHROME_WIN); // admin lain dengan browser yang sama: login pertamanya, bukan perangkat baru

    expect(AdminDevice::count())->toBe(2);
    $a->delete();
    expect(AdminDevice::count())->toBe(1);
});

// ---------- Pembaca User-Agent ----------

it('label perangkat dibaca dari User-Agent', function (?string $agent, string $label) {
    expect(DeviceLabel::from($agent))->toBe($label);
})->with([
    'chrome windows' => [CHROME_WIN, 'Chrome di Windows'],
    'safari iphone' => [SAFARI_IPHONE, 'Safari di iOS'],
    'edge' => ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0', 'Edge di Windows'],
    'firefox linux' => ['Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0', 'Firefox di Linux'],
    'chrome android' => ['Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/126.0.0.0 Mobile Safari/537.36', 'Chrome di Android'],
    'safari mac' => ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.5 Safari/605.1.15', 'Safari di macOS'],
    'kosong' => [null, 'Perangkat tidak dikenal'],
]);
