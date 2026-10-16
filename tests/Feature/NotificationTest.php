<?php

use App\Models\User;
use App\Modules\Helpdesk\Models\HelpdeskThread;
use App\Modules\Notification\Notifications\HelpdeskMessageNotification;
use App\Modules\Notification\Notifications\NewOrderNotification;
use App\Modules\Notification\Notifications\OrderStatusNotification;
use App\Modules\Notification\Notifications\PaymentPaidNotification;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Payment\Enums\PaymentMethod;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Service\Models\Service;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

/*
| Notifikasi lonceng + email. Jalankan: php artisan test --filter=NotificationTest
*/

it('admin mendapat notifikasi saat user membuat pesanan', function () {
    Notification::fake();
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();

    $this->actingAs($user)->post('/orders', [
        'service_id' => Service::factory()->create()->id,
        'contact_name' => 'Budi',
        'contact_phone' => '081234567890',
        'location' => 'Jl. Mawar No. 1',
        'date' => now()->addDay()->toDateString(),
        'time' => '09:00',
    ])->assertSessionHasNoErrors();

    Notification::assertSentTo($admin, NewOrderNotification::class);
    Notification::assertNotSentTo($user, NewOrderNotification::class);
});

it('user mendapat notifikasi database dan email saat admin mengubah status pesanan', function () {
    Notification::fake();
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->create();

    $this->actingAs($admin)->put("/admin/orders/{$order->id}/status", ['status' => 'diproses'])
        ->assertSessionHasNoErrors();

    Notification::assertSentTo($order->user, OrderStatusNotification::class, function ($n, $channels) {
        return $channels === ['database', 'mail'];
    });
    Notification::assertNotSentTo($admin, OrderStatusNotification::class);
});

it('admin yang diberi tahu (bukan user) saat user membatalkan pesanannya sendiri', function () {
    Notification::fake();
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->create();

    $this->actingAs($order->user)->patch("/orders/{$order->id}/cancel")->assertSessionHasNoErrors();

    Notification::assertSentTo($admin, OrderStatusNotification::class, fn ($n, $channels) => $channels === ['database']);
    Notification::assertNotSentTo($order->user, OrderStatusNotification::class);
});

it('user mendapat notifikasi saat pembayaran non-tunai lunas, tunai tidak', function () {
    Notification::fake();
    $order = Order::factory()->for(Service::factory()->create(['price' => 100000]))->create();

    $va = $order->payments()->create([
        'method' => PaymentMethod::VaBca, 'fee' => 0, 'amount' => 100000,
        'status' => PaymentStatus::Menunggu, 'reference' => 'AST-T-1',
    ]);
    $va->update(['status' => PaymentStatus::Lunas, 'paid_at' => now()]);

    $cod = $order->payments()->create([
        'method' => PaymentMethod::Cod, 'fee' => 0, 'amount' => 100000,
        'status' => PaymentStatus::Menunggu, 'reference' => 'AST-T-2',
    ]);
    $cod->update(['status' => PaymentStatus::Lunas, 'paid_at' => now()]);

    Notification::assertSentToTimes($order->user, PaymentPaidNotification::class, 1);
});

it('chat helpdesk memberi notifikasi ke lawan bicara', function () {
    Notification::fake();
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();

    $this->actingAs($user)->postJson('/helpdesk/messages', ['body' => 'Halo admin'])->assertCreated();
    Notification::assertSentTo($admin, HelpdeskMessageNotification::class);

    $thread = HelpdeskThread::where('user_id', $user->id)->sole();
    $this->actingAs($admin)->postJson("/admin/helpdesk/{$thread->id}/messages", ['body' => 'Halo juga'])->assertCreated();
    Notification::assertSentTo($user, HelpdeskMessageNotification::class);
});

it('pesan helpdesk beruntun hanya meninggalkan satu notifikasi belum dibaca per percakapan', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();

    foreach (['satu', 'dua', 'tiga'] as $body) {
        $this->actingAs($user)->postJson('/helpdesk/messages', ['body' => $body])->assertCreated();
    }

    expect($admin->unreadNotifications()->count())->toBe(1)
        ->and($admin->unreadNotifications->first()->data['body'])->toBe('tiga');
});

it('daftar notifikasi hanya milik user yang login dan jumlah belum dibaca ikut dikirim ke halaman', function () {
    $order = Order::factory()->create();
    $other = User::factory()->create();
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin)->put("/admin/orders/{$order->id}/status", ['status' => 'diproses']);

    $this->actingAs($order->user)->getJson('/notifications')
        ->assertOk()
        ->assertJsonPath('unread', 1)
        ->assertJsonPath('items.0.title', 'Pesanan diterima')
        ->assertJsonPath('items.0.url', "/orders/{$order->id}");

    $this->actingAs($other)->getJson('/notifications')->assertJsonPath('items', []);

    $this->actingAs($order->user)->get('/dashboard')
        ->assertInertia(fn (Assert $page) => $page->where('counters.notificationsUnread', 1));
});

it('user dapat menandai satu atau semua notifikasi sebagai dibaca, tetapi tidak milik orang lain', function () {
    $user = User::factory()->create();
    $admin = User::factory()->admin()->create();
    $a = Order::factory()->for($user)->create();
    $b = Order::factory()->for($user)->create();
    $this->actingAs($admin)->put("/admin/orders/{$a->id}/status", ['status' => 'diproses']);
    $this->actingAs($admin)->put("/admin/orders/{$b->id}/status", ['status' => 'diproses']);

    [$first, $second] = $user->notifications()->get()->all();

    $this->actingAs($user)->postJson("/notifications/{$first->id}/read")->assertOk()->assertJsonPath('unread', 1);
    $this->actingAs(User::factory()->create())->postJson("/notifications/{$second->id}/read")->assertNotFound();
    $this->actingAs($user)->postJson('/notifications/read-all')->assertOk()->assertJsonPath('unread', 0);
    expect($user->unreadNotifications()->count())->toBe(0);
});

it('tamu tidak dapat mengakses notifikasi', function () {
    $this->getJson('/notifications')->assertUnauthorized();
});

it('email gagal terkirim tidak menggagalkan aksi utama', function () {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->create();
    config(['mail.default' => 'smtp', 'mail.mailers.smtp.host' => '127.0.0.1', 'mail.mailers.smtp.port' => 1]);

    $this->actingAs($admin)->put("/admin/orders/{$order->id}/status", ['status' => 'diproses'])
        ->assertSessionHasNoErrors();

    expect($order->fresh()->status)->toBe(OrderStatus::Diproses);
});
