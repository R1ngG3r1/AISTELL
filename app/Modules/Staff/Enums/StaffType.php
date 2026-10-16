<?php

namespace App\Modules\Staff\Enums;

/**
 * Cara petugas turun ke lapangan. Hanya indikator: anggota tim tidak dicatat,
 * nama petugas berperan sebagai penanggung jawab.
 */
enum StaffType: string
{
    case Solo = 'solo';
    case Tim = 'tim';

    public function label(): string
    {
        return match ($this) {
            self::Solo => 'Solo',
            self::Tim => 'Tim',
        };
    }

    /** Semua nilai string, dipakai untuk validasi. */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
