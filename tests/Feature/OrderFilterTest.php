<?php

use App\Models\User;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Payment\Enums\PaymentMethod;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Service\Models\Service;
use Inertia\Testing\AssertableInertia as Assert;

/*
| Pencarian, filter, dan pagination daftar pesanan. Jalankan: php artisan test --filter=OrderFilterTest
*/

/** ID pesanan yang tampil di halaman hasil (urutan terbaru dulu). */
function listedIds($response): array
{
    $ids = [];
    $response->assertInertia(function (Assert $page) use (&$ids) {
        $ids = collect($page->toArray()['props']['orders']['data'])->pluck('id')->all();
    });

    return $ids;
}

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

it('admin mencari berdasarkan nama pemesan, email, telepon, dan nama layanan', function () {
    $budi = Order::factory()->create(['contact_name' => 'Budi Santoso', 'contact_phone' => '081111111111']);
    $siti = Order::factory()->for(User::factory()->create(['email' => 'siti@contoh.test']))->create(['contact_name' => 'Siti']);
    $kebun = Order::factory()->for(Service::factory()->create(['name' => 'Perawatan Kebun Unik']))->create();

    expect(listedIds($this->actingAs($this->admin)->get('/admin/orders?q=budi')))->toBe([$budi->id])
        ->and(listedIds($this->actingAs($this->admin)->get('/admin/orders?q=siti@contoh')))->toBe([$siti->id])
        ->and(listedIds($this->actingAs($this->admin)->get('/admin/orders?q=0811111')))->toBe([$budi->id])
        ->and(listedIds($this->actingAs($this->admin)->get('/admin/orders?q=kebun+unik')))->toBe([$kebun->id]);
});

it('mencari dengan nomor pesanan, dengan atau tanpa tanda #', function () {
    $orders = Order::factory()->count(3)->create();
    $target = $orders[1];

    expect(listedIds($this->actingAs($this->admin)->get("/admin/orders?q={$target->id}")))->toContain($target->id)
        ->and(listedIds($this->actingAs($this->admin)->get('/admin/orders?q='.urlencode("#{$target->id}"))))->toContain($target->id);
});

it('karakter % dan _ pada pencarian dianggap huruf biasa', function () {
    Order::factory()->create(['contact_name' => 'Andi']);

    expect(listedIds($this->actingAs($this->admin)->get('/admin/orders?q=%25')))->toBe([])
        ->and(listedIds($this->actingAs($this->admin)->get('/admin/orders?q=_')))->toBe([]);
});

it('admin memfilter berdasarkan status, layanan, dan rentang tanggal jadwal', function () {
    $service = Service::factory()->create();
    $a = Order::factory()->for($service)->status(OrderStatus::Selesai)->create(['date' => '2026-10-05']);
    $b = Order::factory()->for($service)->status(OrderStatus::Menunggu)->create(['date' => '2026-10-20']);
    $c = Order::factory()->status(OrderStatus::Selesai)->create(['date' => '2026-10-20']);

    expect(listedIds($this->actingAs($this->admin)->get("/admin/orders?service={$service->id}")))->toEqualCanonicalizing([$a->id, $b->id])
        ->and(listedIds($this->actingAs($this->admin)->get('/admin/orders?status=selesai')))->toEqualCanonicalizing([$a->id, $c->id])
        ->and(listedIds($this->actingAs($this->admin)->get('/admin/orders?from=2026-10-10')))->toEqualCanonicalizing([$b->id, $c->id])
        ->and(listedIds($this->actingAs($this->admin)->get('/admin/orders?to=2026-10-10')))->toBe([$a->id])
        ->and(listedIds($this->actingAs($this->admin)->get('/admin/orders?from=2026-10-01&to=2026-10-31&status=selesai&service='.$service->id)))->toBe([$a->id]);
});

it('admin memfilter berdasarkan status pembayaran', function () {
    $paid = Order::factory()->create();
    $paid->payments()->create(['method' => PaymentMethod::VaBca, 'fee' => 0, 'amount' => 1, 'status' => PaymentStatus::Lunas, 'reference' => 'R1']);
    $pending = Order::factory()->create();
    $pending->payments()->create(['method' => PaymentMethod::VaBca, 'fee' => 0, 'amount' => 1, 'status' => PaymentStatus::Menunggu, 'reference' => 'R2']);
    $none = Order::factory()->create();

    expect(listedIds($this->actingAs($this->admin)->get('/admin/orders?payment=lunas')))->toBe([$paid->id])
        ->and(listedIds($this->actingAs($this->admin)->get('/admin/orders?payment=belum')))->toEqualCanonicalizing([$pending->id, $none->id]);
});

it('nilai filter yang tidak valid diabaikan tanpa error', function () {
    Order::factory()->count(2)->create();

    $this->actingAs($this->admin)->get('/admin/orders?status=ngawur&service=abc&from=bukan-tanggal&to=2026-99-99&payment=x&q[]=array')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters', ['status' => null, 'q' => null, 'service' => null, 'from' => null, 'to' => null, 'payment' => null])
            ->has('orders.data', 2));
});

it('filter dikirim kembali ke halaman beserta daftar layanan', function () {
    $service = Service::factory()->create();

    $this->actingAs($this->admin)->get("/admin/orders?q=budi&status=diproses&service={$service->id}")
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.q', 'budi')
            ->where('filters.status', 'diproses')
            ->where('filters.service', $service->id)
            ->has('services', 1));
});

it('pagination admin mempertahankan filter di tautan halaman berikutnya', function () {
    Order::factory()->count(17)->status(OrderStatus::Selesai)->create();

    $this->actingAs($this->admin)->get('/admin/orders?status=selesai')
        ->assertInertia(fn (Assert $page) => $page
            ->where('orders.total', 17)
            ->has('orders.data', 15)
            ->where('orders.links.2.url', fn ($url) => str_contains($url, 'status=selesai') && str_contains($url, 'page=2')));
});

it('user hanya mencari dan memfilter pesanannya sendiri', function () {
    $user = User::factory()->create();
    $mine = Order::factory()->for($user)->status(OrderStatus::Selesai)->create(['contact_name' => 'Nama Unik Saya']);
    Order::factory()->for($user)->status(OrderStatus::Menunggu)->create();
    $other = Order::factory()->status(OrderStatus::Selesai)->create(['contact_name' => 'Nama Unik Saya']);

    $ids = listedIds($this->actingAs($user)->get('/orders?q=unik+saya'));
    expect($ids)->toBe([$mine->id])->and($ids)->not->toContain($other->id);

    expect(listedIds($this->actingAs($user)->get('/orders?status=selesai')))->toBe([$mine->id]);

    $this->actingAs($user)->get('/orders?status=selesai&q=x')
        ->assertInertia(fn (Assert $page) => $page->where('filters.status', 'selesai')->has('statuses', 5));
});
