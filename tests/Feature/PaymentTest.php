<?php

use App\Models\User;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Payment\Enums\PaymentMethod;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Payment\Models\Payment;
use App\Modules\Service\Models\Service;
use App\Modules\Order\Services\OrderService;
use Inertia\Testing\AssertableInertia as Assert;

/*
| Pembayaran DUMMY. Jalankan: php artisan test --filter=PaymentTest
*/

function payableOrder(?User $user = null): Order
{
    return Order::factory()
        ->for($user ?? User::factory()->create())
        ->for(Service::factory()->create(['price' => 150000]))
        ->create(['price' => 150000]);
}

it('halaman pembayaran menampilkan pesanan dan daftar metode', function () {
    $order = payableOrder();

    $this->actingAs($order->user)->get("/orders/{$order->id}/payment")
        ->assertInertia(fn (Assert $page) => $page
            ->component('Payments/Show')
            ->where('order.id', $order->id)
            ->where('payment', null)
            ->has('methods', count(PaymentMethod::cases())));
});

it('memilih virtual account membuat nomor VA 16 digit dengan kode bank dan biaya layanan', function () {
    $order = payableOrder();

    $this->actingAs($order->user)->post("/orders/{$order->id}/payment", ['method' => 'va_bca'])
        ->assertRedirect("/orders/{$order->id}/payment")
        ->assertSessionHasNoErrors();

    $payment = $order->payments()->sole();
    expect($payment->status)->toBe(PaymentStatus::Menunggu)
        ->and($payment->code)->toMatch('/^70012\d{11}$/')
        ->and($payment->amount)->toBe('154000.00')
        ->and($payment->expires_at->isFuture())->toBeTrue();
});

it('QRIS berisi payload EMVCo dengan nominal dan checksum', function () {
    $order = payableOrder();

    $this->actingAs($order->user)->post("/orders/{$order->id}/payment", ['method' => 'qris']);

    $code = $order->payments()->sole()->code;
    expect($code)->toStartWith('000201010212')
        ->toContain('5406150000')
        ->toMatch('/6304[0-9A-F]{4}$/');
});

it('ganti metode membatalkan tagihan sebelumnya', function () {
    $order = payableOrder();
    $this->actingAs($order->user)->post("/orders/{$order->id}/payment", ['method' => 'va_bni']);
    $this->actingAs($order->user)->post("/orders/{$order->id}/payment", ['method' => 'alfamart']);

    expect($order->payments()->oldest('id')->first()->status)->toBe(PaymentStatus::Dibatalkan)
        ->and($order->payment()->first()->method)->toBe(PaymentMethod::Alfamart);
});

it('simulasi pembayaran menandai tagihan lunas dan tidak bisa membayar dua kali', function () {
    $order = payableOrder();
    $this->actingAs($order->user)->post("/orders/{$order->id}/payment", ['method' => 'gopay']);

    $this->actingAs($order->user)->post("/orders/{$order->id}/payment/simulate")->assertSessionHas('success');

    expect($order->payment()->first())->status->toBe(PaymentStatus::Lunas)->paid_at->not->toBeNull();

    $this->actingAs($order->user)->post("/orders/{$order->id}/payment", ['method' => 'qris'])->assertSessionHasErrors('method');
});

it('tagihan yang lewat batas waktu menjadi kedaluwarsa', function () {
    $order = payableOrder();
    $this->actingAs($order->user)->post("/orders/{$order->id}/payment", ['method' => 'qris']);

    $this->travel(2)->hours();

    expect($order->payment()->first()->status)->toBe(PaymentStatus::Kedaluwarsa);
    $this->actingAs($order->user)->post("/orders/{$order->id}/payment/simulate")->assertStatus(422);
});

it('pembayaran lunas dikembalikan saat pesanan dibatalkan / ditolak', function () {
    $order = payableOrder();
    $this->actingAs($order->user)->post("/orders/{$order->id}/payment", ['method' => 'va_bri']);
    $this->actingAs($order->user)->post("/orders/{$order->id}/payment/simulate");

    app(OrderService::class)->changeStatus($order->fresh(), OrderStatus::Ditolak);

    expect($order->payment()->first()->status)->toBe(PaymentStatus::Dikembalikan);
});

it('tagihan menunggu dibatalkan saat user membatalkan pesanan', function () {
    $order = payableOrder();
    $this->actingAs($order->user)->post("/orders/{$order->id}/payment", ['method' => 'indomaret']);

    $this->actingAs($order->user)->patch("/orders/{$order->id}/cancel");

    expect($order->payment()->first()->status)->toBe(PaymentStatus::Dibatalkan);
});

it('bayar tunai di lokasi menjadi lunas saat pesanan selesai', function () {
    $order = payableOrder();
    $this->actingAs($order->user)->post("/orders/{$order->id}/payment", ['method' => 'cod']);

    $payment = $order->payment()->first();
    expect($payment->expires_at)->toBeNull()->and($payment->code)->toBeNull();

    // Tunai tidak bisa "disimulasikan" lunas oleh user
    $this->actingAs($order->user)->post("/orders/{$order->id}/payment/simulate")->assertSessionHasErrors('payment');

    $service = app(OrderService::class);
    $service->changeStatus($order->fresh(), OrderStatus::Diproses);
    $service->changeStatus($order->fresh(), OrderStatus::Selesai);

    expect($order->payment()->first()->status)->toBe(PaymentStatus::Lunas);
});

it('user lain dan admin tidak bisa membayar pesanan orang lain', function () {
    $order = payableOrder();

    $this->actingAs(User::factory()->create())->get("/orders/{$order->id}/payment")->assertForbidden();
    $this->actingAs(User::factory()->create())->post("/orders/{$order->id}/payment", ['method' => 'qris'])->assertForbidden();
    $this->actingAs(User::factory()->admin()->create())->post("/orders/{$order->id}/payment", ['method' => 'qris'])->assertForbidden();

    expect(Payment::query()->count())->toBe(0);
});

it('pesanan yang sudah dibatalkan tidak bisa dibayar dan metode harus valid', function () {
    $order = payableOrder();
    $this->actingAs($order->user)->post("/orders/{$order->id}/payment", ['method' => 'bitcoin'])->assertSessionHasErrors('method');

    $order->forceFill(['status' => OrderStatus::Dibatalkan])->save();
    $this->actingAs($order->user)->post("/orders/{$order->id}/payment", ['method' => 'qris'])->assertForbidden();
});

it('status pembayaran ikut dikirim ke detail pesanan user dan admin', function () {
    $order = payableOrder();
    $this->actingAs($order->user)->post("/orders/{$order->id}/payment", ['method' => 'dana']);

    $this->actingAs($order->user)->get("/orders/{$order->id}")
        ->assertInertia(fn (Assert $page) => $page->where('order.payment.status', 'menunggu')->where('order.payment.method_label', 'DANA'));

    $this->actingAs(User::factory()->admin()->create())->get("/admin/orders/{$order->id}")
        ->assertInertia(fn (Assert $page) => $page->where('order.payment.method', 'dana'));
});
