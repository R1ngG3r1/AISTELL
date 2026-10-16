<?php

use App\Models\User;
use App\Modules\Helpdesk\Models\HelpdeskAttachment;
use App\Modules\Helpdesk\Models\HelpdeskMessage;
use App\Modules\Helpdesk\Models\HelpdeskThread;
use App\Modules\Helpdesk\Services\HelpdeskService;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;

/*
| Helpdesk user ↔ admin. Jalankan: php artisan test --filter=HelpdeskTest
*/

it('user membuka helpdesk dan percakapannya dibuat otomatis', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/helpdesk')
        ->assertInertia(fn (Assert $page) => $page->component('Helpdesk/Index')->has('messages', 0));

    expect(HelpdeskThread::where('user_id', $user->id)->exists())->toBeTrue();
});

it('user mengirim pesan dan admin melihatnya di daftar dengan penanda belum dibaca', function () {
    $user = User::factory()->create();
    $admin = User::factory()->admin()->create();

    $this->actingAs($user)->postJson('/helpdesk/messages', ['body' => '  Pesanan saya belum dikonfirmasi  '])
        ->assertCreated()
        ->assertJsonPath('message.body', 'Pesanan saya belum dikonfirmasi')
        ->assertJsonPath('message.from_admin', false);

    $thread = HelpdeskThread::where('user_id', $user->id)->sole();

    $this->actingAs($admin)->get('/admin/helpdesk')
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Helpdesk/Index')
            ->has('threads', 1)
            ->where('threads.0.unread_count', 1)
            ->where('threads.0.last_message.body', 'Pesanan saya belum dikonfirmasi')
            ->where('selected', null));

    // Badge sidebar admin ikut menghitung
    $this->actingAs($admin)->get('/admin/helpdesk')->assertInertia(fn (Assert $page) => $page->where('counters.helpdeskUnread', 1));

    // Admin membuka percakapan → dianggap sudah dibaca
    $this->actingAs($admin)->get("/admin/helpdesk?thread={$thread->id}")
        ->assertInertia(fn (Assert $page) => $page->has('messages', 1)->where('selected.user.id', $user->id));
    expect(app(HelpdeskService::class)->unreadCount($admin))->toBe(0);
});

it('admin membalas dan user menerima lewat polling, lalu pesan ditandai terbaca', function () {
    $user = User::factory()->create();
    $admin = User::factory()->admin()->create();
    $thread = app(HelpdeskService::class)->threadFor($user);
    $first = app(HelpdeskService::class)->send($thread, $user, 'Halo admin');

    $this->actingAs($admin)->postJson("/admin/helpdesk/{$thread->id}/messages", ['body' => 'Halo, ada yang bisa dibantu?'])
        ->assertCreated()
        ->assertJsonPath('message.from_admin', true);

    expect(app(HelpdeskService::class)->unreadCount($user))->toBe(1);

    $this->actingAs($user)->getJson("/helpdesk/messages?after={$first->id}")
        ->assertOk()
        ->assertJsonCount(1, 'messages')
        ->assertJsonPath('messages.0.body', 'Halo, ada yang bisa dibantu?');

    expect(app(HelpdeskService::class)->unreadCount($user))->toBe(0);

    // Polling berikutnya tanpa pesan baru → kosong
    $latest = HelpdeskMessage::max('id');
    $this->actingAs($user)->getJson("/helpdesk/messages?after={$latest}")->assertJsonCount(0, 'messages');
});

it('pesan kosong atau terlalu panjang ditolak', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->postJson('/helpdesk/messages', ['body' => '   '])->assertUnprocessable()->assertJsonValidationErrors('body');
    $this->actingAs($user)->postJson('/helpdesk/messages', ['body' => str_repeat('a', 2001)])->assertUnprocessable();

    expect(HelpdeskMessage::count())->toBe(0);
});

it('user hanya melihat percakapannya sendiri', function () {
    $alice = User::factory()->create();
    $bob = User::factory()->create();
    app(HelpdeskService::class)->send(app(HelpdeskService::class)->threadFor($bob), $bob, 'rahasia bob');

    $this->actingAs($alice)->getJson('/helpdesk/messages')->assertJsonCount(0, 'messages');
    $this->actingAs($alice)->get('/helpdesk')->assertInertia(fn (Assert $page) => $page->has('messages', 0));
});

it('user biasa tidak bisa mengakses helpdesk admin, dan admin tidak memakai helpdesk user', function () {
    $user = User::factory()->create();
    $admin = User::factory()->admin()->create();
    $thread = app(HelpdeskService::class)->threadFor($user);

    $this->actingAs($user)->get('/admin/helpdesk')->assertForbidden();
    $this->actingAs($user)->getJson("/admin/helpdesk/{$thread->id}/messages")->assertForbidden();
    $this->actingAs($user)->postJson("/admin/helpdesk/{$thread->id}/messages", ['body' => 'x'])->assertForbidden();
    $this->actingAs($admin)->get('/helpdesk')->assertForbidden();

    auth()->logout();
    $this->get('/helpdesk')->assertRedirect('/login');
});

it('pengirim bisa mengedit pesan dalam 15 menit dan perubahan sampai ke lawan bicara lewat polling', function () {
    $user = User::factory()->create();
    $admin = User::factory()->admin()->create();
    $service = app(HelpdeskService::class);
    $thread = $service->threadFor($user);
    $message = $service->send($thread, $user, 'Pesanan saya blm dikonfimasi');
    $since = now()->toIso8601String();

    $this->travel(5)->minutes();
    $this->actingAs($user)->patchJson("/helpdesk/messages/{$message->id}", ['body' => 'Pesanan saya belum dikonfirmasi'])
        ->assertOk()->assertJsonPath('message.edited', true)->assertJsonPath('message.body', 'Pesanan saya belum dikonfirmasi');

    $this->actingAs($admin)->getJson("/admin/helpdesk/{$thread->id}/messages?after={$message->id}&since=".urlencode($since))
        ->assertJsonCount(0, 'messages')
        ->assertJsonCount(1, 'updated')
        ->assertJsonPath('updated.0.body', 'Pesanan saya belum dikonfirmasi')
        ->assertJsonPath('updated.0.edited', true);

    // Lewat 15 menit → tidak bisa diedit lagi
    $this->travel(11)->minutes();
    $this->actingAs($user)->patchJson("/helpdesk/messages/{$message->id}", ['body' => 'terlambat'])->assertUnprocessable()->assertJsonValidationErrors('body');
});

it('menghapus pesan mengosongkan isinya dan menampilkan penanda dihapus ke kedua pihak', function () {
    $user = User::factory()->create();
    $admin = User::factory()->admin()->create();
    $service = app(HelpdeskService::class);
    $thread = $service->threadFor($user);
    $message = $service->send($thread, $user, 'salah kirim');
    $since = now()->toIso8601String();

    $this->actingAs($user)->deleteJson("/helpdesk/messages/{$message->id}")
        ->assertOk()->assertJsonPath('message.deleted', true)->assertJsonPath('message.body', null);

    $this->actingAs($admin)->getJson("/admin/helpdesk/{$thread->id}/messages?after={$message->id}&since=".urlencode($since))
        ->assertJsonPath('updated.0.deleted', true);

    expect($message->fresh()->body)->toBeNull()
        ->and(app(HelpdeskService::class)->adminThreads()[0]['last_message']['body'])->toBe('Pesan ini telah dihapus');

    // Pesan terhapus tidak bisa diedit
    $this->actingAs($user)->patchJson("/helpdesk/messages/{$message->id}", ['body' => 'x'])->assertUnprocessable();
});

it('hanya pengirim yang boleh mengedit atau menghapus pesannya', function () {
    $user = User::factory()->create();
    $admin = User::factory()->admin()->create();
    $service = app(HelpdeskService::class);
    $message = $service->send($service->threadFor($user), $user, 'halo');

    $this->actingAs($admin)->patchJson("/helpdesk/messages/{$message->id}", ['body' => 'diubah admin'])->assertForbidden();
    $this->actingAs($admin)->deleteJson("/helpdesk/messages/{$message->id}")->assertForbidden();
    $this->actingAs(User::factory()->create())->deleteJson("/helpdesk/messages/{$message->id}")->assertForbidden();

    expect($message->fresh()->body)->toBe('halo')->and($message->fresh()->deleted_at)->toBeNull();
});

it('lampiran foto tersimpan di database tanpa storage dan hanya bisa diunduh pemilik atau admin', function () {
    $user = User::factory()->create();
    $admin = User::factory()->admin()->create();

    $res = $this->actingAs($user)->post('/helpdesk/messages', [
        'body' => 'ini fotonya',
        'file' => UploadedFile::fake()->image('bukti.jpg', 300, 200),
    ], ['Accept' => 'application/json'])->assertCreated()
        ->assertJsonPath('message.attachment.name', 'bukti.jpg')
        ->assertJsonPath('message.attachment.image', true);

    $url = $res->json('message.attachment.url');

    $this->actingAs($user)->get($url)->assertOk()->assertHeader('Content-Type', 'image/jpeg');
    $this->actingAs($admin)->get($url)->assertOk();
    $this->actingAs(User::factory()->create())->get($url)->assertForbidden();

    // Isi file ada di tabel attachments, daftar pesan tidak membawa isinya
    expect(HelpdeskAttachment::count())->toBe(1)
        ->and(json_encode($res->json()))->not->toContain('data');

    // Hapus pesan → lampiran ikut dibuang
    $this->actingAs($user)->deleteJson('/helpdesk/messages/'.$res->json('message.id'))->assertOk()->assertJsonPath('message.attachment', null);
    expect(HelpdeskAttachment::count())->toBe(0);
});

it('lampiran hanya-file tanpa teks diterima, jenis berbahaya atau terlalu besar ditolak', function () {
    $user = User::factory()->create();
    $json = ['Accept' => 'application/json'];

    $this->actingAs($user)->post('/helpdesk/messages', ['file' => UploadedFile::fake()->create('laporan.pdf', 100, 'application/pdf')], $json)
        ->assertCreated()->assertJsonPath('message.attachment.image', false)->assertJsonPath('message.body', null);

    $this->actingAs($user)->post('/helpdesk/messages', ['file' => UploadedFile::fake()->create('virus.exe', 10, 'application/x-msdownload')], $json)
        ->assertUnprocessable()->assertJsonValidationErrors('file');
    $this->actingAs($user)->post('/helpdesk/messages', ['file' => UploadedFile::fake()->create('besar.pdf', 3000, 'application/pdf')], $json)
        ->assertUnprocessable()->assertJsonValidationErrors('file');
    $this->actingAs($user)->post('/helpdesk/messages', [], $json)->assertUnprocessable()->assertJsonValidationErrors('body');

    expect(HelpdeskMessage::count())->toBe(1);
});
