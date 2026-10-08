<?php

use App\Models\User;
use App\Modules\Address\Models\Address;
use App\Modules\Address\Services\AddressService;
use App\Modules\Order\Models\Order;
use App\Modules\Service\Models\Service;
use Inertia\Testing\AssertableInertia as Assert;

/*
| Buku alamat (Profil Saya) & isi otomatis lokasi pemesanan.
| Jalankan: php artisan test --filter=AddressTest
*/

function addressData(array $overrides = []): array
{
    return array_merge([
        'label' => 'Rumah',
        'address' => 'Way Huwi, Jati Agung, Lampung Selatan, Lampung',
        'detail' => 'Pagar hijau',
        'latitude' => -5.3634512,
        'longitude' => 105.3112345,
    ], $overrides);
}

it('alamat pertama otomatis menjadi alamat utama beserta titik petanya', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post('/addresses', addressData())
        ->assertSessionHasNoErrors()
        ->assertSessionHas('success');

    $address = $user->addresses()->sole();
    expect($address->is_primary)->toBeTrue()
        ->and($address->latitude)->toBe(-5.3634512)
        ->and($address->longitude)->toBe(105.3112345);
});

it('hanya ada satu alamat utama setelah alamat lain dijadikan utama', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/addresses', addressData());
    $this->actingAs($user)->post('/addresses', addressData(['label' => 'Kantor', 'is_primary' => true]));

    expect($user->addresses()->where('is_primary', true)->sole()->label)->toBe('Kantor');

    $rumah = $user->addresses()->where('label', 'Rumah')->sole();
    $this->actingAs($user)->patch("/addresses/{$rumah->id}/primary")->assertSessionHasNoErrors();

    expect($user->addresses()->where('is_primary', true)->sole()->id)->toBe($rumah->id);
});

it('menghapus alamat utama menjadikan alamat lain sebagai alamat utama', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/addresses', addressData());
    $this->actingAs($user)->post('/addresses', addressData(['label' => 'Kantor']));

    $primary = $user->addresses()->where('is_primary', true)->sole();
    $this->actingAs($user)->delete("/addresses/{$primary->id}")->assertSessionHasNoErrors();

    expect($user->addresses()->sole())->label->toBe('Kantor')->is_primary->toBeTrue();
});

it('alamat dapat diubah tanpa titik peta, tetapi titik peta harus berpasangan', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/addresses', addressData());
    $address = $user->addresses()->sole();

    $this->actingAs($user)->put("/addresses/{$address->id}", addressData(['latitude' => null, 'longitude' => null, 'detail' => null]))
        ->assertSessionHasNoErrors();
    expect($address->fresh()->latitude)->toBeNull();

    $this->actingAs($user)->put("/addresses/{$address->id}", addressData(['longitude' => null]))
        ->assertSessionHasErrors('longitude');
    $this->actingAs($user)->put("/addresses/{$address->id}", addressData(['latitude' => 120]))
        ->assertSessionHasErrors('latitude');
});

it('user tidak bisa mengubah atau menghapus alamat milik orang lain', function () {
    $owner = User::factory()->create();
    $this->actingAs($owner)->post('/addresses', addressData());
    $address = $owner->addresses()->sole();

    $other = User::factory()->create();
    $this->actingAs($other)->put("/addresses/{$address->id}", addressData(['label' => 'Curian']))->assertForbidden();
    $this->actingAs($other)->patch("/addresses/{$address->id}/primary")->assertForbidden();
    $this->actingAs($other)->delete("/addresses/{$address->id}")->assertForbidden();

    expect(Address::query()->count())->toBe(1);
});

it('jumlah alamat per akun dibatasi', function () {
    $user = User::factory()->create();
    foreach (range(1, AddressService::MAX_PER_USER) as $i) {
        $user->addresses()->create(addressData(['label' => "Alamat {$i}"]));
    }

    $this->actingAs($user)->post('/addresses', addressData())->assertSessionHasErrors('address');
    expect($user->addresses()->count())->toBe(AddressService::MAX_PER_USER);
});

it('admin tidak memiliki buku alamat', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post('/addresses', addressData())->assertForbidden();
});

it('formulir pemesanan menerima buku alamat dengan alamat utama di urutan pertama', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/addresses', addressData(['label' => 'Rumah']));
    $this->actingAs($user)->post('/addresses', addressData(['label' => 'Kantor']));

    $this->actingAs($user)->get('/orders/create')
        ->assertInertia(fn (Assert $page) => $page
            ->has('addresses', 2)
            ->where('addresses.0.label', 'Rumah')
            ->where('addresses.0.is_primary', true));
});

it('titik peta lokasi tersimpan di pesanan', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post('/orders', [
        'service_id' => Service::factory()->create()->id,
        'contact_name' => 'Budi Santoso',
        'contact_phone' => '081234567890',
        'location' => 'Way Huwi, Jati Agung',
        'latitude' => -5.3634512,
        'longitude' => 105.3112345,
        'date' => now()->addDay()->toDateString(),
        'time' => '09:00',
    ])->assertSessionHasNoErrors();

    expect(Order::firstOrFail())->latitude->toBe(-5.3634512)->longitude->toBe(105.3112345);
});
