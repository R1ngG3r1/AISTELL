<?php

use App\Models\User;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Payment\Enums\PaymentMethod;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Report\Services\ReportExporter;
use App\Modules\Report\Services\ReportPdf;
use App\Modules\Report\Services\ReportService;
use App\Modules\Report\Support\ReportCharts;
use App\Modules\Report\Support\ReportFormat;
use App\Modules\Report\Support\ReportPeriod;
use App\Modules\Review\Models\Review;
use App\Modules\Service\Models\Service;
use App\Modules\Staff\Models\Staff;
use Carbon\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

/*
| Laporan admin: angka, grafik per periode, dan ekspor CSV.
| Jalankan: php artisan test --filter=ReportTest
*/

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

/** Pesanan yang dibuat pada $daysAgo hari lalu. */
function reportOrder(int $daysAgo = 0, OrderStatus $status = OrderStatus::Menunggu, ?Service $service = null, array $attrs = []): Order
{
    return Order::factory()
        ->for($service ?? Service::factory()->create())
        ->status($status)
        ->create(['created_at' => today()->subDays($daysAgo)->setTime(10, 0), ...$attrs]);
}

/** Pembayaran untuk pesanan, dibayar $paidDaysAgo hari lalu. */
function reportPayment(Order $order, float $amount, int $paidDaysAgo = 0, PaymentStatus $status = PaymentStatus::Lunas, PaymentMethod $method = PaymentMethod::VaBca): void
{
    $order->payments()->create([
        'method' => $method, 'fee' => 0, 'amount' => $amount, 'status' => $status,
        'reference' => 'R'.uniqid(), 'paid_at' => $status === PaymentStatus::Menunggu ? null : today()->subDays($paidDaysAgo)->setTime(12, 0),
    ]);
}

function reportData($response): array
{
    $data = [];
    $response->assertInertia(function (Assert $page) use (&$data) {
        $data = $page->toArray()['props'];
    });

    return $data;
}

// ---------- Akses ----------

it('hanya admin yang dapat membuka laporan dan mengekspornya', function () {
    $user = User::factory()->create();

    $this->actingAs($this->admin)->get('/admin/reports')->assertOk()->assertInertia(fn (Assert $page) => $page->component('Admin/Reports/Index'));
    $this->actingAs($user)->get('/admin/reports')->assertForbidden();
    $this->actingAs($user)->get('/admin/reports/export')->assertForbidden();

    auth()->logout();
    $this->get('/admin/reports')->assertRedirect('/login');
    $this->get('/admin/reports/export')->assertRedirect('/login');
});

// ---------- Periode ----------

it('periode bawaan adalah 30 hari terakhir dengan satu titik per hari', function () {
    $data = reportData($this->actingAs($this->admin)->get('/admin/reports'));

    expect($data['filters'])->toBe(['range' => '30d', 'from' => today()->subDays(29)->toDateString(), 'to' => today()->toDateString()])
        ->and($data['report']['granularity'])->toBe('day')
        ->and($data['report']['revenueSeries'])->toHaveCount(30)
        ->and($data['report']['ordersSeries'])->toHaveCount(30)
        ->and($data['report']['revenueSeries'][29]['key'])->toBe(today()->toDateString());
});

it('pilihan periode menghasilkan rentang tanggal yang benar', function (string $range, string $from) {
    $this->actingAs($this->admin)->get("/admin/reports?range={$range}")
        ->assertInertia(fn (Assert $page) => $page->where('filters.range', $range)->where('filters.from', $from)->where('filters.to', today()->toDateString()));
})->with(fn () => [
    '7 hari' => ['7d', today()->subDays(6)->toDateString()],
    '90 hari' => ['90d', today()->subDays(89)->toDateString()],
    'bulan ini' => ['month', today()->startOfMonth()->toDateString()],
    'tahun ini' => ['year', today()->startOfYear()->toDateString()],
]);

it('rentang panjang ditampilkan per bulan, dan semua bulan terisi', function () {
    $data = reportData($this->actingAs($this->admin)->get('/admin/reports?range=year'));

    expect($data['report']['granularity'])->toBe(today()->dayOfYear() <= 62 ? 'day' : 'month');

    $custom = reportData($this->actingAs($this->admin)->get('/admin/reports?range=custom&from=2026-01-15&to=2026-06-10'));
    expect($custom['report']['granularity'])->toBe('month')
        ->and(collect($custom['report']['revenueSeries'])->pluck('key')->all())->toBe(['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06']);
});

it('rentang custom yang terbalik ditukar, dan terlalu panjang dipotong ke 366 hari', function () {
    $swapped = reportData($this->actingAs($this->admin)->get('/admin/reports?range=custom&from=2026-10-20&to=2026-10-10'));
    expect($swapped['filters'])->toMatchArray(['range' => 'custom', 'from' => '2026-10-10', 'to' => '2026-10-20']);

    $long = reportData($this->actingAs($this->admin)->get('/admin/reports?range=custom&from=2020-01-01&to=2026-10-10'));
    expect($long['filters']['to'])->toBe('2026-10-10')
        ->and(Carbon::parse($long['filters']['from'])->diffInDays('2026-10-10'))->toEqual(365);
});

it('parameter periode yang tidak valid kembali ke 30 hari tanpa error', function (string $query) {
    $this->actingAs($this->admin)->get("/admin/reports?{$query}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('filters.range', '30d'));
})->with([
    'range ngawur' => ['range=sepanjang-masa'],
    'custom tanpa tanggal' => ['range=custom'],
    'custom tanggal rusak' => ['range=custom&from=bukan&to=2026-10-10'],
    'tanggal mustahil' => ['range=custom&from=2026-99-99&to=2026-10-10'],
    'array' => ['range[]=7d&from[]=x'],
]);

// ---------- Angka ----------

it('pendapatan hanya menghitung pembayaran lunas yang dibayar pada periode', function () {
    reportPayment(reportOrder(2), 100000, paidDaysAgo: 2);
    reportPayment(reportOrder(3), 50000, paidDaysAgo: 1);
    reportPayment(reportOrder(4), 999000, paidDaysAgo: 0, status: PaymentStatus::Menunggu);
    reportPayment(reportOrder(5), 888000, paidDaysAgo: 1, status: PaymentStatus::Dikembalikan);
    reportPayment(reportOrder(6), 777000, paidDaysAgo: 1, status: PaymentStatus::Dibatalkan);
    reportPayment(reportOrder(40), 666000, paidDaysAgo: 40); // di luar 30 hari

    $data = reportData($this->actingAs($this->admin)->get('/admin/reports?range=7d'));

    expect($data['report']['summary']['revenue']['value'])->toEqual(150000);
});

it('pendapatan dihitung dari tanggal bayar, bukan tanggal pesanan dibuat', function () {
    reportPayment(reportOrder(20), 200000, paidDaysAgo: 1); // dipesan lama, dibayar kemarin

    $data = reportData($this->actingAs($this->admin)->get('/admin/reports?range=7d'));

    expect($data['report']['summary']['revenue']['value'])->toEqual(200000)
        ->and($data['report']['summary']['orders']['value'])->toBe(0);
});

it('pesanan dan pesanan selesai dihitung dari tanggal pesanan dibuat', function () {
    reportOrder(1);
    reportOrder(2, OrderStatus::Selesai);
    reportOrder(3, OrderStatus::Selesai);
    reportOrder(4, OrderStatus::Dibatalkan);
    reportOrder(30); // di luar 7 hari

    $data = reportData($this->actingAs($this->admin)->get('/admin/reports?range=7d'));

    expect($data['report']['summary']['orders']['value'])->toBe(4)
        ->and($data['report']['summary']['completed']['value'])->toBe(2);
});

it('perbandingan dengan periode sebelumnya dihitung persen, dan kosong jika sebelumnya nol', function () {
    // 7 hari terakhir: 3 pesanan. 7 hari sebelumnya: 2 pesanan.
    foreach ([0, 1, 2] as $d) {
        reportOrder($d);
    }
    foreach ([8, 9] as $d) {
        reportOrder($d);
    }
    reportPayment(reportOrder(1), 300000, paidDaysAgo: 1);   // periode ini
    reportPayment(reportOrder(9), 200000, paidDaysAgo: 9);   // periode sebelumnya

    $summary = reportData($this->actingAs($this->admin)->get('/admin/reports?range=7d'))['report']['summary'];

    expect($summary['orders'])->toMatchArray(['value' => 4, 'previous' => 3])
        ->and($summary['orders']['delta'])->toEqual(33.3)
        ->and($summary['revenue']['delta'])->toEqual(50.0)
        ->and($summary['completed']['delta'])->toBeNull(); // sebelumnya 0 → tidak ada persen
});

it('rating rata-rata hanya dari ulasan pada periode', function () {
    foreach ([5, 4] as $rating) {
        $order = reportOrder(1, OrderStatus::Selesai);
        Review::factory()->for($order)->create(['rating' => $rating, 'user_id' => $order->user_id, 'service_id' => $order->service_id]);
    }
    $old = reportOrder(40, OrderStatus::Selesai);
    Review::factory()->for($old)->create(['rating' => 1, 'user_id' => $old->user_id, 'service_id' => $old->service_id, 'created_at' => today()->subDays(40)]);

    $rating = reportData($this->actingAs($this->admin)->get('/admin/reports?range=7d'))['report']['summary']['rating'];

    expect($rating['value'])->toEqual(4.5)->and($rating['count'])->toBe(2);

    $empty = reportData($this->actingAs($this->admin)->get('/admin/reports?range=custom&from=2020-01-01&to=2020-01-31'))['report']['summary']['rating'];
    expect($empty['value'])->toBeNull()->and($empty['count'])->toBe(0);
});

// ---------- Grafik ----------

it('seri grafik per hari terisi nol untuk hari tanpa data dan menjumlah hari yang sama', function () {
    reportPayment(reportOrder(2), 100000, paidDaysAgo: 2);
    reportPayment(reportOrder(2), 50000, paidDaysAgo: 2);
    reportOrder(2);

    $report = reportData($this->actingAs($this->admin)->get('/admin/reports?range=7d'))['report'];
    $revenue = collect($report['revenueSeries'])->keyBy('key');
    $orders = collect($report['ordersSeries'])->keyBy('key');
    $day = today()->subDays(2)->toDateString();

    expect($revenue)->toHaveCount(7)
        ->and($revenue[$day]['value'])->toEqual(150000)
        ->and($revenue[$day]['count'])->toBe(2)
        ->and($revenue[today()->toDateString()]['value'])->toEqual(0)
        ->and($orders[$day]['value'])->toBe(3);
});

it('seri per bulan menjumlahkan semua hari dalam bulan itu', function () {
    $order = reportOrder(0, attrs: ['created_at' => '2026-03-05 10:00:00']);
    reportOrder(0, attrs: ['created_at' => '2026-03-20 10:00:00']);
    $order->payments()->create(['method' => PaymentMethod::Qris, 'fee' => 0, 'amount' => 70000, 'status' => PaymentStatus::Lunas, 'reference' => 'RM1', 'paid_at' => '2026-03-05 11:00:00']);

    $report = reportData($this->actingAs($this->admin)->get('/admin/reports?range=custom&from=2026-02-01&to=2026-04-30'))['report'];
    $orders = collect($report['ordersSeries'])->keyBy('key');

    expect($orders->keys()->all())->toBe(['2026-02', '2026-03', '2026-04'])
        ->and($orders['2026-03']['value'])->toBe(2)
        ->and($orders['2026-02']['value'])->toBe(0)
        ->and(collect($report['revenueSeries'])->keyBy('key')['2026-03']['value'])->toEqual(70000);
});

it('pesanan per layanan diurutkan dari pendapatan terbesar', function () {
    $kecil = Service::factory()->create(['name' => 'Layanan Kecil']);
    $besar = Service::factory()->create(['name' => 'Layanan Besar']);
    reportPayment(reportOrder(1, service: $kecil), 10000);
    reportPayment(reportOrder(1, service: $besar), 90000);
    reportOrder(1, service: $besar);

    $rows = reportData($this->actingAs($this->admin)->get('/admin/reports?range=7d'))['report']['byService'];

    expect($rows[0])->toMatchArray(['name' => 'Layanan Besar', 'orders' => 2])
        ->and($rows[0]['revenue'])->toEqual(90000)
        ->and($rows[1]['name'])->toBe('Layanan Kecil');
});

it('layanan lebih dari delapan digabung menjadi Lainnya tanpa kehilangan total', function () {
    foreach (range(1, 10) as $i) {
        reportPayment(reportOrder(1, service: Service::factory()->create()), $i * 1000);
    }

    $rows = reportData($this->actingAs($this->admin)->get('/admin/reports?range=7d'))['report']['byService'];

    expect($rows)->toHaveCount(8)
        ->and($rows[7]['name'])->toBe('Lainnya')
        ->and($rows[7]['orders'])->toBe(3)
        ->and(collect($rows)->sum('revenue'))->toEqual(55000);
});

it('pendapatan per metode memakai nama metode, dan status pesanan selalu menampilkan kelima status', function () {
    reportPayment(reportOrder(1), 100000, method: PaymentMethod::Qris);
    reportPayment(reportOrder(1), 50000, method: PaymentMethod::Qris);
    reportPayment(reportOrder(1), 30000, method: PaymentMethod::VaBca);
    reportOrder(1, OrderStatus::Selesai);

    $report = reportData($this->actingAs($this->admin)->get('/admin/reports?range=7d'))['report'];

    expect($report['byMethod'][0])->toMatchArray(['name' => 'QRIS', 'count' => 2])
        ->and($report['byMethod'][0]['revenue'])->toEqual(150000)
        ->and($report['byMethod'][1]['name'])->toBe('BCA Virtual Account')
        ->and(collect($report['byStatus'])->pluck('name')->all())->toBe(['Menunggu', 'Diproses', 'Selesai', 'Ditolak', 'Dibatalkan'])
        ->and(collect($report['byStatus'])->firstWhere('name', 'Selesai')['value'])->toBe(1);
});

it('laporan kosong tidak error dan semua angka nol', function () {
    $report = reportData($this->actingAs($this->admin)->get('/admin/reports'))['report'];

    expect($report['summary']['revenue']['value'])->toEqual(0)
        ->and($report['summary']['orders']['value'])->toBe(0)
        ->and($report['byService'])->toBe([])
        ->and($report['byMethod'])->toBe([]);
});

// ---------- Ekspor ----------

/** Isi CSV hasil unduhan sebagai array baris. */
function csvRows($response): array
{
    $content = $response->streamedContent();
    expect($content)->toStartWith("\xEF\xBB\xBF");

    return array_map(fn ($line) => str_getcsv($line), array_filter(explode("\n", substr($content, 3))));
}

it('ekspor CSV berisi header dan satu baris per pesanan pada periode', function () {
    $inside = reportOrder(1, OrderStatus::Selesai, attrs: ['contact_name' => 'Budi Santoso', 'contact_phone' => '081234567890']);
    reportPayment($inside, 154000, method: PaymentMethod::Qris);
    reportOrder(40); // di luar periode

    $response = $this->actingAs($this->admin)->get('/admin/reports/export?range=7d')->assertOk()
        ->assertDownload('laporan-aistel_'.today()->subDays(6)->toDateString().'_sd_'.today()->toDateString().'.csv');
    $rows = csvRows($response);

    expect($response->headers->get('content-type'))->toContain('text/csv')
        ->and($rows)->toHaveCount(2)
        ->and($rows[0])->toBe(ReportExporter::HEADERS)
        ->and($rows[1][0])->toBe((string) $inside->id)
        ->and($rows[1][4])->toBe('Budi Santoso')
        ->and($rows[1][10])->toBe('Selesai')
        ->and($rows[1][13])->toBe('154000')
        ->and($rows[1][14])->toBe('Lunas')
        ->and($rows[1][15])->toBe('QRIS');
});

it('ekspor mencantumkan petugas, jenis petugas, rating, dan pembayaran yang belum lunas', function () {
    $staff = Staff::factory()->team()->create(['name' => 'Siti']);
    $order = reportOrder(1, OrderStatus::Selesai);
    $order->forceFill(['staff_id' => $staff->id])->save();
    Review::factory()->for($order)->create(['rating' => 5, 'user_id' => $order->user_id, 'service_id' => $order->service_id]);
    reportPayment($order, 100000, status: PaymentStatus::Menunggu);

    $row = csvRows($this->actingAs($this->admin)->get('/admin/reports/export?range=7d'))[1];

    expect($row[8])->toBe('Siti')->and($row[9])->toBe('Tim')
        ->and($row[12])->toBe('100000')->and($row[13])->toBe('0')
        ->and($row[14])->toBe('Menunggu Pembayaran')->and($row[16])->toBe('')
        ->and($row[17])->toBe('5');
});

it('ekspor menetralkan teks yang bisa dibaca Excel sebagai rumus', function (string $name, string $expected) {
    reportOrder(1, attrs: ['contact_name' => $name]);

    $row = csvRows($this->actingAs($this->admin)->get('/admin/reports/export?range=7d'))[1];

    expect($row[4])->toBe($expected);
})->with([
    'rumus =' => ['=HYPERLINK("http://jahat.test")', "'=HYPERLINK(\"http://jahat.test\")"],
    'rumus @' => ['@SUM(A1)', "'@SUM(A1)"],
    'rumus +' => ['+cmd|calc', "'+cmd|calc"],
    'rumus -' => ['-2+3+cmd', "'-2+3+cmd"],
    'nama biasa' => ['Budi Santoso', 'Budi Santoso'],
]);

it('nomor telepon berawalan plus tidak diubah oleh penetralan rumus', function () {
    reportOrder(1, attrs: ['contact_phone' => '+62 812-3456-7890']);

    expect(csvRows($this->actingAs($this->admin)->get('/admin/reports/export?range=7d'))[1][5])->toBe('+62 812-3456-7890');
});

it('ekspor laporan kosong hanya berisi header', function () {
    expect(csvRows($this->actingAs($this->admin)->get('/admin/reports/export?range=7d')))->toHaveCount(1);
});

it('ekspor tidak lagi menyediakan varian Excel: format apa pun menghasilkan CSV koma', function () {
    reportOrder(1, attrs: ['contact_name' => 'Siti, Rahma']);

    $rows = csvRows($this->actingAs($this->admin)->get('/admin/reports/export?range=7d&format=excel'));

    expect($rows[0])->toBe(ReportExporter::HEADERS)->and($rows[1][4])->toBe('Siti, Rahma');
});

// ---------- Rekap PDF ----------

it('admin dapat mengunduh rekap PDF periode yang dipilih', function () {
    reportPayment(reportOrder(1, OrderStatus::Selesai), 150000);

    $response = $this->actingAs($this->admin)->get('/admin/reports/pdf?range=7d')
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf')
        ->assertDownload('laporan-aistel_'.today()->subDays(6)->toDateString().'_sd_'.today()->toDateString().'.pdf');

    expect($response->getContent())->toStartWith('%PDF');
});

it('rekap PDF juga dibuat untuk laporan kosong, periode panjang (per bulan), dan parameter tidak valid', function (string $query) {
    $this->actingAs($this->admin)->get("/admin/reports/pdf?{$query}")
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
})->with([
    'kosong' => ['range=custom&from=2020-01-01&to=2020-01-31'],
    'per bulan' => ['range=year'],
    'tidak valid' => ['range=ngawur&from[]=x'],
]);

it('rekap PDF memuat data dari banyak layanan dan metode tanpa error', function () {
    foreach (range(1, 12) as $i) {
        reportPayment(reportOrder($i % 5, OrderStatus::Selesai, Service::factory()->create(['name' => "Layanan <b>{$i}</b> & Co"])), $i * 10000, method: PaymentMethod::cases()[$i % 9]);
    }

    $this->actingAs($this->admin)->get('/admin/reports/pdf?range=30d')->assertOk();
});

it('hanya admin yang dapat mengunduh rekap PDF', function () {
    $this->actingAs(User::factory()->create())->get('/admin/reports/pdf')->assertForbidden();

    auth()->logout();
    $this->get('/admin/reports/pdf')->assertRedirect('/login');
});

// ---------- Pemformat & grafik PDF ----------

it('pemformat memakai gaya angka Indonesia', function () {
    expect(ReportFormat::rupiah(8440000))->toBe('Rp 8.440.000')
        ->and(ReportFormat::number(1234.56, 1))->toBe('1.234,6')
        ->and(ReportFormat::compact(0))->toBe('0')
        ->and(ReportFormat::compact(500))->toBe('500')
        ->and(ReportFormat::compact(2500))->toBe('2,5 rb')
        ->and(ReportFormat::compact(750000))->toBe('750 rb')
        ->and(ReportFormat::compact(1500000))->toBe('1,5 jt')
        ->and(ReportFormat::compact(3000000000))->toBe('3 M')
        ->and(ReportFormat::delta(12.5))->toBe('▲ +12,5%')
        ->and(ReportFormat::delta(-3.0))->toBe('▼ -3%')
        ->and(ReportFormat::delta(0.0))->toBe('– 0%')
        ->and(ReportFormat::delta(null))->toBe('Belum ada pembanding');
});

it('grafik PDF berupa SVG yang valid, termasuk saat tanpa data dan titik tunggal', function (array $points) {
    $uri = ReportCharts::line($points, 'day');

    expect($uri)->toStartWith('data:image/svg+xml;base64,');

    $svg = base64_decode(substr($uri, strlen('data:image/svg+xml;base64,')));
    $doc = new DOMDocument;
    expect($doc->loadXML($svg))->toBeTrue()
        ->and($doc->documentElement->nodeName)->toBe('svg');
})->with([
    'tanpa data' => [[]],
    'semua nol' => [[['key' => '2026-10-01', 'value' => 0], ['key' => '2026-10-02', 'value' => 0]]],
    'satu titik' => [[['key' => '2026-10-01', 'value' => 5000]]],
    'beberapa titik' => [[['key' => '2026-10-01', 'value' => 100], ['key' => '2026-10-02', 'value' => 900], ['key' => '2026-10-03', 'value' => 400]]],
]);

it('rincian rekap hanya memuat hari yang ada aktivitas', function () {
    reportPayment(reportOrder(2), 100000, paidDaysAgo: 2);

    $period = new ReportPeriod(today()->subDays(6), today());
    $breakdown = (new ReflectionMethod(ReportPdf::class, 'breakdown'));
    $rows = $breakdown->invoke(app(ReportPdf::class), app(ReportService::class)->build($period));

    expect($rows)->toHaveCount(1)->and($rows[0]['key'])->toBe(today()->subDays(2)->toDateString());
});
