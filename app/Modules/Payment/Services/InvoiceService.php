<?php

namespace App\Modules\Payment\Services;

use App\Modules\Order\Models\Order;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Payment\Models\Payment;
use Barryvdh\DomPDF\Facade\Pdf;
use Barryvdh\DomPDF\PDF as PdfDocument;

/** Invoice PDF: hanya untuk pesanan yang pembayarannya sudah Lunas. */
class InvoiceService
{
    /** Pembayaran lunas terbaru pesanan, atau null jika belum ada (invoice belum tersedia). */
    public function paidPayment(Order $order): ?Payment
    {
        return $order->payments()->where('status', PaymentStatus::Lunas)->latest('id')->first();
    }

    /** Nama file unduhan, mis. "Invoice-AST-20261008-K3J9QX.pdf". */
    public function filename(Payment $payment): string
    {
        return 'Invoice-'.$payment->reference.'.pdf';
    }

    public function render(Order $order, Payment $payment): PdfDocument
    {
        $order->loadMissing('service', 'user');

        return Pdf::loadView('invoices.invoice', [
            'order' => $order,
            'payment' => $payment,
            'price' => (float) ($order->price ?? $order->service?->price ?? 0),
            'fee' => (float) $payment->fee,
            'total' => (float) $payment->amount,
        ])->setPaper('a4');
    }
}
