<?php

namespace App\Modules\Notification\Notifications;

use App\Modules\Payment\Models\Payment;

/** Untuk user: pembayaran diterima. */
class PaymentPaidNotification extends AppNotification
{
    protected string $kind = 'payment';

    protected bool $mail = true;

    public function __construct(private Payment $payment) {}

    public function title(): string
    {
        return 'Pembayaran diterima';
    }

    public function body(): string
    {
        $amount = 'Rp'.number_format((float) $this->payment->amount, 0, ',', '.');

        return "Pembayaran {$amount} via {$this->payment->method_label} berhasil (ref. {$this->payment->reference}).";
    }

    public function url(): string
    {
        return route('orders.show', $this->payment->order_id, false);
    }
}
