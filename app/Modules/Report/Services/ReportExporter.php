<?php

namespace App\Modules\Report\Services;

use App\Modules\Order\Models\Order;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Report\Support\ReportPeriod;
use Generator;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Ekspor daftar pesanan yang dibuat pada rentang laporan ke CSV.
 *
 * CSV standar (pemisah koma) yang bisa dibuka di Google Sheets, Excel, dan aplikasi lain.
 * Berkas diberi BOM UTF-8 agar Excel membaca huruf dan simbol dengan benar.
 */
class ReportExporter
{
    public const HEADERS = [
        'No. Pesanan', 'Dipesan', 'Tanggal Layanan', 'Jam', 'Pemesan', 'Telepon', 'Email Akun', 'Layanan',
        'Petugas', 'Jenis Petugas', 'Status Pesanan', 'Harga Layanan (Rp)', 'Total Tagihan (Rp)', 'Dibayar (Rp)',
        'Status Pembayaran', 'Metode Pembayaran', 'Waktu Bayar', 'Rating',
    ];

    public function __construct(private ReportService $reports) {}

    public function download(ReportPeriod $period): StreamedResponse
    {
        $filename = $period->filename().'.csv';

        return response()->streamDownload(function () use ($period) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // BOM UTF-8

            fputcsv($out, self::HEADERS);
            foreach ($this->rows($period) as $row) {
                fputcsv($out, array_map([$this, 'safe'], $row));
            }

            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /** Satu baris per pesanan, dibaca bertahap agar hemat memori. @return Generator<int, array<int, string|int|null>> */
    public function rows(ReportPeriod $period): Generator
    {
        $query = $this->reports->ordersIn($period)
            ->with(['service:id,name', 'user:id,email', 'staff:id,name,type', 'payments', 'review:id,order_id,rating'])
            ->orderBy('orders.id');

        foreach ($query->lazyById(500, 'orders.id', 'id') as $order) {
            /** @var Order $order */
            $payment = $order->payments->sortByDesc('id')->first();
            $paid = $order->payments->first(fn ($p) => $p->status === PaymentStatus::Lunas);

            yield [
                $order->id,
                $order->created_at->format('Y-m-d H:i'),
                $order->date->toDateString(),
                substr($order->time, 0, 5),
                $order->contact_name,
                $order->contact_phone,
                $order->user?->email,
                $order->service?->name,
                $order->staff?->name,
                $order->staff?->type->label(),
                $order->status->label(),
                $order->price === null ? null : (int) round((float) $order->price),
                $payment ? (int) round((float) $payment->amount) : null,
                $paid ? (int) round((float) $paid->amount) : 0,
                $payment?->status->label(),
                $payment?->method->label(),
                $paid?->paid_at?->format('Y-m-d H:i'),
                $order->review?->rating,
            ];
        }
    }

    /**
     * Cegah "CSV injection": teks yang diawali = @ (atau + / - yang bukan angka/telepon) dibaca
     * Excel sebagai rumus. Nama pemesan berasal dari input pengguna, jadi diberi awalan '.
     */
    private function safe(mixed $value): mixed
    {
        if (! is_string($value) || $value === '') {
            return $value;
        }

        $formula = preg_match('/^[=@\t\r]/', $value)
            || (preg_match('/^[+-]/', $value) && ! preg_match('/^[+-]?[\d\s().-]+$/', $value));

        return $formula ? "'".$value : $value;
    }
}
