<?php

use App\Models\User;
use App\Modules\Order\Models\Order;
use App\Modules\Payment\Enums\PaymentMethod;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Service\Models\Service;

/*
| Invoice PDF. Jalankan: php artisan test --filter=InvoiceTest
*/

function paidOrder(PaymentStatus $status = PaymentStatus::Lunas, PaymentMethod $method = PaymentMethod::VaBca): Order
{
    $order = Order::factory()->for(Service::factory()->create(['price' => 150000]))->create(['price' => 150000]);
    $order->payments()->create([
        'method' => $method, 'fee' => 4000, 'amount' => 154000, 'status' => $status,
        'reference' => 'AST-20261016-ABC123', 'paid_at' => $status === PaymentStatus::Lunas ? now() : null,
    ]);

    return $order;
}

it('pemilik dapat mengunduh invoice PDF untuk pesanan yang lunas', function () {
    $order = paidOrder();

    $response = $this->actingAs($order->user)->get("/orders/{$order->id}/invoice");

    $response->assertOk()
        ->assertHeader('content-type', 'application/pdf')
        ->assertDownload('Invoice-AST-20261016-ABC123.pdf');
    expect($response->getContent())->toStartWith('%PDF');
});

it('admin juga dapat mengunduh invoice pesanan mana pun', function () {
    $order = paidOrder();

    $this->actingAs(User::factory()->admin()->create())->get("/orders/{$order->id}/invoice")->assertOk()->assertDownload();
});

it('invoice belum tersedia sebelum lunas', function (PaymentStatus $status) {
    $order = paidOrder($status);

    $this->actingAs($order->user)->get("/orders/{$order->id}/invoice")->assertNotFound();
})->with([PaymentStatus::Menunggu, PaymentStatus::Kedaluwarsa, PaymentStatus::Dibatalkan, PaymentStatus::Dikembalikan]);

it('pesanan tanpa pembayaran tidak punya invoice', function () {
    $order = Order::factory()->create();

    $this->actingAs($order->user)->get("/orders/{$order->id}/invoice")->assertNotFound();
});

it('user lain tidak bisa mengunduh invoice orang lain dan tamu diarahkan ke login', function () {
    $order = paidOrder();

    $this->actingAs(User::factory()->create())->get("/orders/{$order->id}/invoice")->assertForbidden();

    auth()->logout();
    $this->get("/orders/{$order->id}/invoice")->assertRedirect('/login');
});

it('invoice tunai yang lunas saat pesanan selesai juga bisa diunduh', function () {
    $order = paidOrder(PaymentStatus::Lunas, PaymentMethod::Cod);

    $this->actingAs($order->user)->get("/orders/{$order->id}/invoice")->assertOk();
});
