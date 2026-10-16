<?php

namespace App\Modules\Payment\Services;

use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Payment\Enums\PaymentMethod;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Payment\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Pembayaran DUMMY: nomor VA, kode bayar, dan QRIS dibuat acak di sini. Selama belum
 * ada payment gateway, tagihan non-tunai otomatis dilunasi oleh confirmPaid() beberapa
 * detik setelah kodenya dibuat (meniru notifikasi gateway). Saat memakai gateway
 * sungguhan, hapus confirmPaid() dan tandai Lunas lewat webhook/callback.
 * Bayar tunai (COD) tetap Menunggu sampai pesanan selesai (lihat syncWithOrder()).
 */
class PaymentService
{
    /** Jeda minimal (detik) antara kode dibuat dan pembayaran dianggap masuk (dummy). */
    public const CONFIRM_DELAY = 3;

    /** Pembayaran terbaru sebuah pesanan (null jika belum pernah memilih metode). */
    public function current(Order $order): ?Payment
    {
        return $order->payments()->latest('id')->first();
    }

    public function isPaid(Order $order): bool
    {
        return $order->payments()->where('status', PaymentStatus::Lunas)->exists();
    }

    /**
     * User memilih metode → buat tagihan baru. Tagihan lama yang masih menunggu
     * dibatalkan (ganti metode).
     *
     * @throws ValidationException jika pesanan tidak bisa dibayar lagi
     */
    public function create(Order $order, PaymentMethod $method): Payment
    {
        if (! in_array($order->status, OrderStatus::active(), true)) {
            throw ValidationException::withMessages(['method' => 'Pesanan ini sudah tidak dapat dibayar.']);
        }
        if ($this->isPaid($order)) {
            throw ValidationException::withMessages(['method' => 'Pesanan ini sudah lunas.']);
        }

        return DB::transaction(function () use ($order, $method) {
            $order->payments()->where('status', PaymentStatus::Menunggu)->update(['status' => PaymentStatus::Dibatalkan]);

            $base = (float) ($order->price ?? $order->service?->price ?? 0);
            $amount = $base + $method->fee();
            $hours = $method->expiresInHours();

            return $order->payments()->create([
                'method' => $method,
                'fee' => $method->fee(),
                'amount' => $amount,
                'status' => PaymentStatus::Menunggu,
                'reference' => $this->newReference(),
                'code' => $this->makeCode($method, $amount),
                'expires_at' => $hours ? now()->addHours($hours) : null,
            ]);
        });
    }

    /**
     * DUMMY: pembayaran non-tunai dianggap masuk setelah jeda singkat, seolah gateway
     * mengirim notifikasi. Tunai tidak pernah lewat sini.
     *
     * @throws ValidationException
     */
    public function confirmPaid(Payment $payment): Payment
    {
        if ($payment->status !== PaymentStatus::Menunggu || $payment->method === PaymentMethod::Cod) {
            throw ValidationException::withMessages(['payment' => 'Tagihan ini tidak dapat dibayar.']);
        }
        if ($payment->created_at->diffInSeconds(now()) < self::CONFIRM_DELAY - 1) {
            throw ValidationException::withMessages(['payment' => 'Pembayaran masih diproses.']);
        }

        $payment->status = PaymentStatus::Lunas;
        $payment->paid_at = now();
        $payment->save();

        return $payment;
    }

    /**
     * Dipanggil otomatis saat status pesanan berubah (lihat PaymentServiceProvider):
     * - ditolak / dibatalkan → tagihan menunggu dibatalkan, yang sudah lunas dikembalikan (refund)
     * - selesai → pembayaran tunai di lokasi dianggap lunas
     */
    public function syncWithOrder(Order $order): void
    {
        $payments = $order->payments();

        match ($order->status) {
            OrderStatus::Ditolak, OrderStatus::Dibatalkan => DB::transaction(function () use ($order) {
                $order->payments()->where('status', PaymentStatus::Menunggu)->update(['status' => PaymentStatus::Dibatalkan]);
                $order->payments()->where('status', PaymentStatus::Lunas)->update(['status' => PaymentStatus::Dikembalikan]);
            }),
            OrderStatus::Selesai => $payments
                ->where('status', PaymentStatus::Menunggu)
                ->where('method', PaymentMethod::Cod)
                ->update(['status' => PaymentStatus::Lunas, 'paid_at' => now()]),
            default => null,
        };
    }

    /** @return array<int, array{value: string, label: string, group: string, fee: int}> */
    public function methodOptions(): array
    {
        return array_map(fn (PaymentMethod $m) => $m->toOption(), PaymentMethod::cases());
    }

    private function newReference(): string
    {
        do {
            $ref = 'AST-'.now()->format('Ymd').'-'.strtoupper(Str::random(6));
        } while (Payment::query()->where('reference', $ref)->exists());

        return $ref;
    }

    private function makeCode(PaymentMethod $method, float $amount): ?string
    {
        return match ($method->group()) {
            // Nomor VA 16 digit: kode perusahaan bank + angka acak
            'va' => $method->vaPrefix().$this->digits(16 - strlen($method->vaPrefix())),
            // Kode bayar di kasir gerai
            'retail' => 'AST'.$this->digits(11),
            'qris', 'ewallet' => $this->qrisPayload($amount),
            default => null,
        };
    }

    private function digits(int $length): string
    {
        return collect(range(1, $length))->map(fn () => random_int(0, 9))->implode('');
    }

    /**
     * Isi QR berformat QRIS (standar EMVCo) agar terlihat seperti QRIS asli.
     * Tetap DUMMY: merchant ID acak, tidak bisa dibayar dengan aplikasi sungguhan.
     */
    private function qrisPayload(float $amount): string
    {
        $tag = fn (string $id, string $value) => $id.str_pad((string) strlen($value), 2, '0', STR_PAD_LEFT).$value;

        $merchant = $tag('00', 'ID.CO.QRIS.WWW').$tag('01', '93600914'.$this->digits(10)).$tag('02', 'ID'.$this->digits(13)).$tag('03', 'UMI');

        $payload = $tag('00', '01')
            .$tag('01', '12') // 12 = QR dinamis (sekali pakai, nominal tetap)
            .$tag('26', $merchant)
            .$tag('52', '7349') // kategori: jasa kebersihan
            .$tag('53', '360') // IDR
            .$tag('54', (string) (int) round($amount))
            .$tag('58', 'ID')
            .$tag('59', 'AISTEL')
            .$tag('60', 'BANDAR LAMPUNG')
            .'6304';

        return $payload.$this->crc16($payload);
    }

    /** CRC16-CCITT (0xFFFF), checksum wajib di akhir payload QRIS. */
    private function crc16(string $data): string
    {
        $crc = 0xFFFF;
        foreach (str_split($data) as $char) {
            $crc ^= ord($char) << 8;
            for ($i = 0; $i < 8; $i++) {
                $crc = ($crc & 0x8000) ? (($crc << 1) ^ 0x1021) & 0xFFFF : ($crc << 1) & 0xFFFF;
            }
        }

        return strtoupper(str_pad(dechex($crc), 4, '0', STR_PAD_LEFT));
    }
}
