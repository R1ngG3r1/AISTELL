<?php

namespace App\Modules\Order\Requests;

use App\Modules\Order\Enums\OrderStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Throwable;

/**
 * Filter daftar pesanan dari query string (?status=&q=&service=&from=&to=&payment=).
 * Nilai yang tidak valid diabaikan, bukan menyebabkan error: filter hanyalah
 * pilihan tampilan, dan URL-nya bisa saja disimpan atau diedit manual.
 */
class OrderFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [];
    }

    /**
     * @return array{status: ?OrderStatus, q: ?string, service: ?int, from: ?string, to: ?string, payment: ?string}
     */
    public function filters(): array
    {
        $q = trim($this->param('q'));

        return [
            'status' => OrderStatus::tryFrom($this->param('status')),
            'q' => $q === '' ? null : mb_substr($q, 0, 100),
            'service' => ctype_digit($this->param('service')) ? (int) $this->param('service') : null,
            'from' => $this->dateParam('from'),
            'to' => $this->dateParam('to'),
            // lunas = sudah dibayar, belum = belum ada pembayaran lunas
            'payment' => in_array($this->query('payment'), ['lunas', 'belum'], true) ? $this->query('payment') : null,
        ];
    }

    /** Bentuk yang dikirim ke frontend untuk mengisi ulang kolom filter. */
    public function forView(): array
    {
        $f = $this->filters();
        $f['status'] = $f['status']?->value;

        return $f;
    }

    /** Parameter query sebagai string; array (?q[]=x) dianggap kosong. */
    private function param(string $key): string
    {
        $value = $this->query($key);

        return is_string($value) ? $value : '';
    }

    private function dateParam(string $key): ?string
    {
        $value = $this->param($key);

        try {
            // Carbon "meluapkan" tanggal mustahil (2026-99-99 → 2034-06-07), jadi hasilnya harus sama persis dengan input.
            $date = preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) ? Carbon::createFromFormat('!Y-m-d', $value) : null;

            return $date && $date->format('Y-m-d') === $value ? $value : null;
        } catch (Throwable) {
            return null;
        }
    }
}
