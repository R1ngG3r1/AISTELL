<?php

namespace App\Modules\Order\Enums;

/**
 * PRD 11 — Status pesanan.
 *
 * Kenapa pakai Enum dan bukan string biasa? Supaya tidak ada typo
 * ('diproses' vs 'di proses') dan semua aturan status berada di satu tempat.
 *
 * Alur yang diizinkan:
 *
 *   menunggu ──terima──▶ diproses ──▶ selesai
 *      │                    │
 *      ├──tolak──▶ ditolak  └──▶ dibatalkan
 *      └──batal──▶ dibatalkan
 */
enum OrderStatus: string
{
    case Menunggu = 'menunggu';
    case Diproses = 'diproses';
    case Selesai = 'selesai';
    case Ditolak = 'ditolak';
    case Dibatalkan = 'dibatalkan';

    /** Teks yang ramah untuk ditampilkan di frontend. */
    public function label(): string
    {
        return match ($this) {
            self::Menunggu => 'Menunggu',
            self::Diproses => 'Diproses',
            self::Selesai => 'Selesai',
            self::Ditolak => 'Ditolak',
            self::Dibatalkan => 'Dibatalkan',
        };
    }

    /**
     * Status tujuan yang boleh dipilih dari status saat ini.
     * Selesai, Ditolak, dan Dibatalkan adalah status akhir (tidak bisa diubah lagi).
     *
     * @return array<int, self>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Menunggu => [self::Diproses, self::Ditolak, self::Dibatalkan],
            self::Diproses => [self::Selesai, self::Dibatalkan],
            default => [],
        };
    }

    public function canTransitionTo(self $next): bool
    {
        return in_array($next, $this->allowedTransitions(), true);
    }

    /** Semua nilai string, dipakai untuk aturan validasi. */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
