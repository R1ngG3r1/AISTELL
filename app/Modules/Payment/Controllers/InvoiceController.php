<?php

namespace App\Modules\Payment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Order\Models\Order;
use App\Modules\Payment\Services\InvoiceService;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

/** Unduh invoice PDF: pemilik pesanan atau admin. */
class InvoiceController extends Controller
{
    public function __construct(private InvoiceService $invoices) {}

    // GET /orders/{order}/invoice
    public function show(Order $order): Response
    {
        // OrderPolicy::view → pemilik atau admin, selain itu 403.
        Gate::authorize('view', $order);

        $payment = $this->invoices->paidPayment($order);
        abort_if(! $payment, 404);

        return $this->invoices->render($order, $payment)->download($this->invoices->filename($payment));
    }
}
