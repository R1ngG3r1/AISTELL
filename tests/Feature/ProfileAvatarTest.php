<?php

use App\Models\User;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Services\AvatarService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(fn () => Storage::fake(User::AVATAR_DISK));

it('user dapat mengunggah foto profil yang dipotong persegi', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/profile/avatar', ['avatar' => UploadedFile::fake()->image('foto.jpg', 1200, 800)])
        ->assertSessionHasNoErrors()
        ->assertSessionHas('success');

    $user->refresh();
    expect($user->avatar_path)->toStartWith('avatars/')
        ->and($user->avatar_url)->toContain("/avatars/{$user->id}?v=");
    Storage::disk(User::AVATAR_DISK)->assertExists($user->avatar_path);

    [$width, $height] = getimagesizefromstring(Storage::disk(User::AVATAR_DISK)->get($user->avatar_path));
    expect([$width, $height])->toBe([AvatarService::SIZE, AvatarService::SIZE]);
});

it('mengganti foto menghapus file lama', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/profile/avatar', ['avatar' => UploadedFile::fake()->image('a.png', 500, 500)]);
    $old = $user->fresh()->avatar_path;

    $this->actingAs($user)->post('/profile/avatar', ['avatar' => UploadedFile::fake()->image('b.png', 500, 500)]);

    Storage::disk(User::AVATAR_DISK)->assertMissing($old);
    Storage::disk(User::AVATAR_DISK)->assertExists($user->fresh()->avatar_path);
});

it('memvalidasi file foto profil', function (UploadedFile $file) {
    $this->actingAs(User::factory()->create())
        ->post('/profile/avatar', ['avatar' => $file])
        ->assertSessionHasErrors('avatar');
})->with([
    'bukan gambar' => fn () => UploadedFile::fake()->create('dokumen.pdf', 100, 'application/pdf'),
    'lebih dari 2 MB' => fn () => UploadedFile::fake()->image('besar.jpg')->size(3000),
]);

it('user dapat menghapus foto profil', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/profile/avatar', ['avatar' => UploadedFile::fake()->image('a.jpg')]);
    $path = $user->fresh()->avatar_path;

    $this->actingAs($user)->delete('/profile/avatar')->assertSessionHas('success');

    expect($user->fresh()->avatar_path)->toBeNull();
    Storage::disk(User::AVATAR_DISK)->assertMissing($path);
});

it('foto profil hanya bisa dilihat akun yang login', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/profile/avatar', ['avatar' => UploadedFile::fake()->image('a.jpg')]);
    $url = $user->fresh()->avatar_url;

    $this->actingAs(User::factory()->create())->get($url)->assertOk();

    auth()->logout();
    $this->get($url)->assertRedirect('/login');
});

it('foto ikut terhapus saat akun dihapus', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/profile/avatar', ['avatar' => UploadedFile::fake()->image('a.jpg')]);
    $path = $user->fresh()->avatar_path;

    $this->actingAs($user)->delete('/profile', ['password' => 'password']);

    Storage::disk(User::AVATAR_DISK)->assertMissing($path);
});

it('avatar_url dikirim ke frontend tanpa membocorkan path file', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/profile/avatar', ['avatar' => UploadedFile::fake()->image('a.jpg')]);

    $this->actingAs($user)->get('/dashboard')
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.user.avatar_url', $user->fresh()->avatar_url)
            ->missing('auth.user.avatar_path'));
});

it('alamat utama tersimpan dan halaman profil berisi ringkasan akun', function () {
    $user = User::factory()->create();
    Order::factory()->for($user)->create();
    Order::factory()->for($user)->status(OrderStatus::Selesai)->create();

    $this->actingAs($user)->patch('/profile', [
        'name' => $user->name,
        'email' => $user->email,
        'address' => 'Jl. Mawar No. 1, Bandung',
    ])->assertSessionHasNoErrors();

    expect($user->fresh()->address)->toBe('Jl. Mawar No. 1, Bandung');

    $this->actingAs($user)->get('/profile')
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.user.address', 'Jl. Mawar No. 1, Bandung')
            ->where('summary.orders.total', 2)
            ->where('summary.orders.selesai', 1)
            ->has('summary.memberSince'));
});
