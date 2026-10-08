<?php

namespace App\Modules\Payment\Enums;

/**
 *   menunggu ──bayar──▶ lunas ──(pesanan ditolak/dibatalkan)──▶ dikembalikan
 *      ├──lewat batas waktu──▶ kedaluwarsa
 *      └──ganti metode / pesanan batal──▶ dibatalkan
 */
enum PaymentStatus: string
{
    case Menunggu = 'menunggu';
    case Lunas = 'lunas';
    case Kedaluwarsa = 'kedaluwarsa';
    case Dibatalkan = 'dibatalkan';
    case Dikembalikan = 'dikembalikan';

    public function label(): string
    {
        return match ($this) {
            self::Menunggu => 'Menunggu Pembayaran',
            self::Lunas => 'Lunas',
            self::Kedaluwarsa => 'Kedaluwarsa',
            self::Dibatalkan => 'Dibatalkan',
            self::Dikembalikan => 'Dana Dikembalikan',
        };
    }
}
