<?php

use App\Models\User;
use App\Modules\Notification\Notifications\StaffAssignedNotification;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Service\Models\Service;
use App\Modules\Staff\Models\Staff;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

/*
| Petugas lapangan, penugasan, jadwal bentrok, dan kuota harian.
| Jalankan: php artisan test --filter=StaffTest
*/

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->service = Service::factory()->create(['duration_minutes' => 120]);
});

/** Pesanan pada tanggal & jam tertentu untuk layanan bawaan test; bisa langsung diberi petugas. */
function orderAt(string $time, string $date = '2026-11-10', ?Service $service = null, OrderStatus $status = OrderStatus::Menunggu, ?Staff $staff = null): Order
{
    $order = Order::factory()->for($service ?? test()->service)->status($status)->create(['date' => $date, 'time' => $time]);

    // staff_id sengaja tidak mass-assignable (hanya lewat StaffService), jadi di test diisi lewat forceFill.
    if ($staff) {
        $order->forceFill(['staff_id' => $staff->id])->save();
    }

    return $order;
}

// ---------- CRUD ----------

it('admin menambah, mengubah, menonaktifkan, dan menghapus petugas', function () {
    $this->actingAs($this->admin)->post('/admin/staff', ['name' => 'Budi', 'phone' => '081234567890'])
        ->assertSessionHasNoErrors();
    $staff = Staff::sole();
    expect($staff->is_active)->toBeTrue();

    $this->actingAs($this->admin)->put("/admin/staff/{$staff->id}", ['name' => 'Budi S', 'phone' => '0812-3456-789', 'is_active' => false])
        ->assertSessionHasNoErrors();
    expect($staff->fresh())->name->toBe('Budi S')->is_active->toBeFalse();

    $this->actingAs($this->admin)->delete("/admin/staff/{$staff->id}")->assertSessionHas('success');
    expect(Staff::count())->toBe(0);
});

it('data petugas divalidasi', function (array $data, string $field) {
    $this->actingAs($this->admin)->post('/admin/staff', $data)->assertSessionHasErrors($field);

    expect(Staff::count())->toBe(0);
})->with([
    'tanpa nama' => [['phone' => '081234567890'], 'name'],
    'nama terlalu panjang' => [['name' => str_repeat('a', 101), 'phone' => '081234567890'], 'name'],
    'tanpa telepon' => [['name' => 'Budi'], 'phone'],
    'telepon berisi huruf' => [['name' => 'Budi', 'phone' => '08abc12345'], 'phone'],
    'telepon terlalu pendek' => [['name' => 'Budi', 'phone' => '0812'], 'phone'],
]);

it('petugas yang pernah ditugaskan tidak bisa dihapus', function () {
    $staff = Staff::factory()->create();
    orderAt('09:00', staff: $staff);

    $this->actingAs($this->admin)->delete("/admin/staff/{$staff->id}")->assertSessionHas('error');

    expect(Staff::count())->toBe(1);
});

it('halaman petugas menampilkan jumlah jadwal mendatang', function () {
    $staff = Staff::factory()->create();
    orderAt('09:00', now()->addDays(3)->toDateString(), staff: $staff);
    orderAt('13:00', now()->subDays(3)->toDateString(), staff: $staff);
    orderAt('15:00', now()->addDays(5)->toDateString(), status: OrderStatus::Selesai, staff: $staff);

    $this->actingAs($this->admin)->get('/admin/staff')
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Staff/Index')
            ->where('staff.0.upcoming_orders_count', 1)
            ->where('staff.0.orders_count', 3));
});

it('user biasa dan tamu tidak bisa mengelola petugas', function () {
    $user = User::factory()->create();
    $staff = Staff::factory()->create();
    $order = orderAt('09:00');

    $this->actingAs($user)->get('/admin/staff')->assertForbidden();
    $this->actingAs($user)->post('/admin/staff', ['name' => 'X', 'phone' => '081234567890'])->assertForbidden();
    $this->actingAs($user)->put("/admin/orders/{$order->id}/staff", ['staff_id' => $staff->id])->assertForbidden();

    auth()->logout();
    $this->get('/admin/staff')->assertRedirect('/login');
});

// ---------- Penugasan ----------

it('admin menugaskan petugas pada pesanan dan user diberi tahu', function () {
    $staff = Staff::factory()->create(['name' => 'Siti']);
    $order = orderAt('09:00');
    Notification::fake();

    $this->actingAs($this->admin)->put("/admin/orders/{$order->id}/staff", ['staff_id' => $staff->id])
        ->assertSessionHasNoErrors();

    expect($order->fresh()->staff_id)->toBe($staff->id);
    Notification::assertSentTo($order->user, StaffAssignedNotification::class);
});

it('admin dapat melepas petugas dari pesanan tanpa notifikasi', function () {
    $staff = Staff::factory()->create();
    $order = orderAt('09:00', staff: $staff);
    Notification::fake();

    $this->actingAs($this->admin)->put("/admin/orders/{$order->id}/staff", ['staff_id' => null])->assertSessionHasNoErrors();

    expect($order->fresh()->staff_id)->toBeNull();
    Notification::assertNothingSent();
});

it('penugasan ditolak jika jadwal petugas bentrok', function (string $existing, string $new, bool $conflict) {
    $staff = Staff::factory()->create(['name' => 'Siti']);
    orderAt($existing, staff: $staff); // 120 menit
    $order = orderAt($new);

    $response = $this->actingAs($this->admin)->put("/admin/orders/{$order->id}/staff", ['staff_id' => $staff->id]);

    if ($conflict) {
        $response->assertSessionHasErrors('staff_id');
        expect($order->fresh()->staff_id)->toBeNull();
    } else {
        $response->assertSessionHasNoErrors();
        expect($order->fresh()->staff_id)->toBe($staff->id);
    }
})->with([
    'jam sama' => ['09:00', '09:00', true],
    'beririsan sebagian' => ['09:00', '10:30', true],
    'mulai sebelum yang lain selesai' => ['09:00', '08:00', true],
    'tepat setelah selesai' => ['09:00', '11:00', false],
    'tepat sebelum mulai' => ['11:00', '09:00', false],
    'jauh berbeda' => ['08:00', '15:00', false],
]);

it('durasi layanan dipakai untuk mendeteksi bentrok', function () {
    $staff = Staff::factory()->create();
    $long = Service::factory()->create(['duration_minutes' => 300]);
    orderAt('08:00', service: $long, staff: $staff); // 08:00–13:00
    $order = orderAt('12:00');

    $this->actingAs($this->admin)->put("/admin/orders/{$order->id}/staff", ['staff_id' => $staff->id])->assertSessionHasErrors('staff_id');
});

it('hari berbeda atau pesanan yang sudah tidak aktif tidak dianggap bentrok', function () {
    $staff = Staff::factory()->create();
    orderAt('09:00', '2026-11-11', staff: $staff);
    orderAt('09:00', status: OrderStatus::Selesai, staff: $staff);
    orderAt('09:00', status: OrderStatus::Dibatalkan, staff: $staff);
    $order = orderAt('09:00');

    $this->actingAs($this->admin)->put("/admin/orders/{$order->id}/staff", ['staff_id' => $staff->id])->assertSessionHasNoErrors();
});

it('petugas nonaktif tidak bisa ditugaskan, pesanan berstatus akhir tidak bisa diubah petugasnya', function () {
    $inactive = Staff::factory()->inactive()->create();
    $active = Staff::factory()->create();

    $order = orderAt('09:00');
    $this->actingAs($this->admin)->put("/admin/orders/{$order->id}/staff", ['staff_id' => $inactive->id])->assertSessionHasErrors('staff_id');

    foreach ([OrderStatus::Selesai, OrderStatus::Ditolak, OrderStatus::Dibatalkan] as $status) {
        $done = orderAt('09:00', status: $status);
        $this->actingAs($this->admin)->put("/admin/orders/{$done->id}/staff", ['staff_id' => $active->id])->assertSessionHasErrors('staff_id');
    }
});

it('staff_id tidak ada ditolak dan harus dikirim', function () {
    $order = orderAt('09:00');

    $this->actingAs($this->admin)->put("/admin/orders/{$order->id}/staff", ['staff_id' => 99999])->assertSessionHasErrors('staff_id');
    $this->actingAs($this->admin)->put("/admin/orders/{$order->id}/staff", [])->assertSessionHasErrors('staff_id');
});

it('detail pesanan admin menandai petugas yang bentrok', function () {
    $busy = Staff::factory()->create(['name' => 'Sibuk']);
    $free = Staff::factory()->create(['name' => 'Luang']);
    orderAt('09:00', staff: $busy);
    $order = orderAt('10:00');

    $this->actingAs($this->admin)->get("/admin/orders/{$order->id}")
        ->assertInertia(fn (Assert $page) => $page
            ->has('staffOptions', 2)
            ->where('staffOptions', fn ($opts) => collect($opts)->firstWhere('id', $busy->id)['busy'] !== null
                && collect($opts)->firstWhere('id', $free->id)['busy'] === null));
});

it('petugas yang sedang ditugaskan tetap muncul walau nonaktif, dan tidak dianggap bentrok dengan dirinya', function () {
    $staff = Staff::factory()->create();
    $order = orderAt('09:00', staff: $staff);
    $staff->update(['is_active' => false]);

    $this->actingAs($this->admin)->get("/admin/orders/{$order->id}")
        ->assertInertia(fn (Assert $page) => $page->has('staffOptions', 1)->where('staffOptions.0.busy', null));
});

it('user melihat petugas pesanannya', function () {
    $staff = Staff::factory()->create(['name' => 'Siti', 'phone' => '081234567890']);
    $order = orderAt('09:00', staff: $staff);

    $this->actingAs($order->user)->get("/orders/{$order->id}")
        ->assertInertia(fn (Assert $page) => $page->where('order.staff.name', 'Siti')->where('order.staff.phone', '081234567890'));
});

// ---------- Kuota harian ----------

it('pesanan baru ditolak jika kuota tanggal itu penuh', function () {
    config(['aistel.daily_quota' => 2]);
    $date = now()->addDays(2)->toDateString();
    orderAt('08:00', $date);
    orderAt('10:00', $date);
    $user = User::factory()->create();

    $this->actingAs($user)->post('/orders', [
        'service_id' => $this->service->id, 'contact_name' => 'Budi', 'contact_phone' => '081234567890',
        'location' => 'Jl. Mawar No. 1', 'date' => $date, 'time' => '14:00',
    ])->assertSessionHasErrors(['date' => 'Jadwal pada tanggal ini sudah penuh. Silakan pilih tanggal lain.']);

    expect(Order::where('user_id', $user->id)->count())->toBe(0);
});

it('kuota hanya menghitung pesanan aktif pada tanggal yang sama, dan 0 berarti tanpa batas', function () {
    config(['aistel.daily_quota' => 1]);
    $date = now()->addDays(2)->toDateString();
    orderAt('08:00', $date, status: OrderStatus::Dibatalkan);
    orderAt('09:00', $date, status: OrderStatus::Ditolak);
    orderAt('10:00', now()->addDays(3)->toDateString());
    $user = User::factory()->create();
    $payload = [
        'service_id' => $this->service->id, 'contact_name' => 'Budi', 'contact_phone' => '081234567890',
        'location' => 'Jl. Mawar No. 1', 'date' => $date, 'time' => '14:00',
    ];

    $this->actingAs($user)->post('/orders', $payload)->assertSessionHasNoErrors();
    $this->actingAs($user)->post('/orders', $payload)->assertSessionHasErrors('date'); // kini penuh

    config(['aistel.daily_quota' => 0]);
    $this->actingAs($user)->post('/orders', $payload)->assertSessionHasNoErrors();
});

// ---------- Durasi layanan ----------

it('admin mengatur durasi layanan dengan batas wajar, dan kosong berarti default 120 menit', function () {
    $this->actingAs($this->admin)->post('/admin/services', ['name' => 'Cuci Karpet', 'price' => 100000, 'duration_minutes' => 45])
        ->assertSessionHasNoErrors();
    expect(Service::where('name', 'Cuci Karpet')->value('duration_minutes'))->toBe(45);

    $this->actingAs($this->admin)->post('/admin/services', ['name' => 'Cuci Sofa', 'price' => 100000])->assertSessionHasNoErrors();
    expect(Service::where('name', 'Cuci Sofa')->value('duration_minutes'))->toBe(120);

    foreach ([5, 721, 'abc'] as $bad) {
        $this->actingAs($this->admin)->post('/admin/services', ['name' => 'X'.$bad, 'price' => 1, 'duration_minutes' => $bad])
            ->assertSessionHasErrors('duration_minutes');
    }
});

// ---------- Solo / Tim ----------

it('petugas bisa didaftarkan sebagai solo atau tim, dan kosong berarti solo', function () {
    $this->actingAs($this->admin)->post('/admin/staff', ['name' => 'Budi', 'phone' => '081234567890', 'type' => 'tim'])
        ->assertSessionHasNoErrors();
    $this->actingAs($this->admin)->post('/admin/staff', ['name' => 'Siti', 'phone' => '081234567891', 'type' => 'solo'])
        ->assertSessionHasNoErrors();
    $this->actingAs($this->admin)->post('/admin/staff', ['name' => 'Agus', 'phone' => '081234567892'])
        ->assertSessionHasNoErrors();

    expect(Staff::where('name', 'Budi')->sole()->isTeam())->toBeTrue()
        ->and(Staff::where('name', 'Siti')->sole()->isTeam())->toBeFalse()
        ->and(Staff::where('name', 'Agus')->sole()->type->value)->toBe('solo');
});

it('jenis petugas hanya menerima solo atau tim', function () {
    $this->actingAs($this->admin)->post('/admin/staff', ['name' => 'Budi', 'phone' => '081234567890', 'type' => 'regu'])
        ->assertSessionHasErrors('type');

    expect(Staff::count())->toBe(0);
});

it('admin dapat mengubah jenis petugas, dan update tanpa type tidak mengubahnya', function () {
    $staff = Staff::factory()->create();

    $this->actingAs($this->admin)->put("/admin/staff/{$staff->id}", ['name' => $staff->name, 'phone' => $staff->phone, 'type' => 'tim'])
        ->assertSessionHasNoErrors();
    expect($staff->fresh()->isTeam())->toBeTrue();

    $this->actingAs($this->admin)->put("/admin/staff/{$staff->id}", ['name' => 'Nama Baru', 'phone' => $staff->phone])
        ->assertSessionHasNoErrors();
    expect($staff->fresh())->name->toBe('Nama Baru')->isTeam()->toBeTrue();
});

it('jenis petugas dikirim ke halaman petugas, pilihan penugasan, dan detail pesanan user', function () {
    $team = Staff::factory()->team()->create(['name' => 'Siti']);
    $order = orderAt('09:00', staff: $team);

    $this->actingAs($this->admin)->get('/admin/staff')
        ->assertInertia(fn (Assert $page) => $page->where('staff.0.type', 'tim'));
    $this->actingAs($this->admin)->get("/admin/orders/{$order->id}")
        ->assertInertia(fn (Assert $page) => $page->where('staffOptions.0.type', 'tim')->where('order.staff.type', 'tim'));
    $this->actingAs($order->user)->get("/orders/{$order->id}")
        ->assertInertia(fn (Assert $page) => $page->where('order.staff.type', 'tim'));
});

it('notifikasi penugasan menyebut penanggung jawab untuk tim dan hanya nama untuk solo', function () {
    $team = Staff::factory()->team()->create(['name' => 'Siti']);
    $solo = Staff::factory()->create(['name' => 'Budi']);
    $order = orderAt('09:00');

    $this->actingAs($this->admin)->put("/admin/orders/{$order->id}/staff", ['staff_id' => $team->id]);
    $this->actingAs($this->admin)->put("/admin/orders/{$order->id}/staff", ['staff_id' => $solo->id]);

    $bodies = $order->user->notifications()->where('type', StaffAssignedNotification::class)->get()->pluck('data.body');
    expect($bodies->contains(fn ($b) => str_contains($b, 'Tim Siti (penanggung jawab)')))->toBeTrue()
        ->and($bodies->contains(fn ($b) => str_starts_with($b, 'Budi akan mengerjakan')))->toBeTrue();
});

it('tim diperlakukan sama untuk cek jadwal bentrok', function () {
    $team = Staff::factory()->team()->create();
    orderAt('09:00', staff: $team);
    $order = orderAt('10:00');

    $this->actingAs($this->admin)->put("/admin/orders/{$order->id}/staff", ['staff_id' => $team->id])->assertSessionHasErrors('staff_id');
});
