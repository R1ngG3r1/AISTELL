<?php

namespace App\Modules\Payment\Enums;

/**
 * Metode pembayaran (DUMMY - belum terhubung ke payment gateway sungguhan).
 * Nantinya nilai di sini bisa dipetakan ke channel Midtrans/Xendit/dll.
 */
enum PaymentMethod: string
{
    case Qris = 'qris';

    case VaBca = 'va_bca';
    case VaBni = 'va_bni';
    case VaBri = 'va_bri';
    case VaMandiri = 'va_mandiri';
    case VaPermata = 'va_permata';
    case VaBsi = 'va_bsi';

    case Gopay = 'gopay';
    case Ovo = 'ovo';
    case Dana = 'dana';
    case Shopeepay = 'shopeepay';

    case Alfamart = 'alfamart';
    case Indomaret = 'indomaret';

    case Cod = 'cod';

    public function label(): string
    {
        return match ($this) {
            self::Qris => 'QRIS',
            self::VaBca => 'BCA Virtual Account',
            self::VaBni => 'BNI Virtual Account',
            self::VaBri => 'BRI Virtual Account',
            self::VaMandiri => 'Mandiri Virtual Account',
            self::VaPermata => 'Permata Virtual Account',
            self::VaBsi => 'BSI Virtual Account',
            self::Gopay => 'GoPay',
            self::Ovo => 'OVO',
            self::Dana => 'DANA',
            self::Shopeepay => 'ShopeePay',
            self::Alfamart => 'Alfamart / Alfamidi',
            self::Indomaret => 'Indomaret',
            self::Cod => 'Bayar Tunai di Lokasi',
        };
    }

    /** Kelompok tampilan: qris | va | ewallet | retail | cod */
    public function group(): string
    {
        return match ($this) {
            self::Qris => 'qris',
            self::VaBca, self::VaBni, self::VaBri, self::VaMandiri, self::VaPermata, self::VaBsi => 'va',
            self::Gopay, self::Ovo, self::Dana, self::Shopeepay => 'ewallet',
            self::Alfamart, self::Indomaret => 'retail',
            self::Cod => 'cod',
        };
    }

    /** Biaya layanan (dummy), ditambahkan ke total bayar. */
    public function fee(): int
    {
        return match ($this->group()) {
            'va' => 4000,
            'retail' => 5000,
            'ewallet' => 1500,
            default => 0, // QRIS & tunai gratis
        };
    }

    /** Kode perusahaan (prefix) nomor Virtual Account per bank (dummy). */
    public function vaPrefix(): ?string
    {
        return match ($this) {
            self::VaBca => '70012',
            self::VaBni => '8808',
            self::VaBri => '26215',
            self::VaMandiri => '89508',
            self::VaPermata => '8625',
            self::VaBsi => '9347',
            default => null,
        };
    }

    /** Batas waktu bayar dalam jam. Null = tanpa batas (tunai dibayar saat layanan). */
    public function expiresInHours(): ?int
    {
        return match ($this->group()) {
            'cod' => null,
            'qris', 'ewallet' => 1,
            default => 24,
        };
    }

    /** Untuk ditampilkan di pilihan metode (React). */
    public function toOption(): array
    {
        return ['value' => $this->value, 'label' => $this->label(), 'group' => $this->group(), 'fee' => $this->fee()];
    }
}
