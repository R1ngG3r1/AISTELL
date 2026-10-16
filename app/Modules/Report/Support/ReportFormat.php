<?php

namespace App\Modules\Report\Support;

use Illuminate\Support\Carbon;

/** Pemformat angka dan tanggal Indonesia untuk rekap PDF (titik ribuan, koma desimal). */
final class ReportFormat
{
    public static function rupiah(float|int $value): string
    {
        return 'Rp '.number_format($value, 0, ',', '.');
    }

    public static function number(float|int $value, int $decimals = 0): string
    {
        return number_format($value, $decimals, ',', '.');
    }

    /** Angka ringkas untuk sumbu: 0 / 500 rb / 1,5 jt / 2 M. */
    public static function compact(float|int $value): string
    {
        $abs = abs($value);

        return match (true) {
            $abs >= 1_000_000_000 => self::trim($value / 1_000_000_000).' M',
            $abs >= 1_000_000 => self::trim($value / 1_000_000).' jt',
            $abs >= 1_000 => self::trim($value / 1_000).' rb',
            default => self::trim($value),
        };
    }

    /** Persentase berawalan panah dan tanda, mis. "▲ +12,5%". Null = belum ada pembanding. */
    public static function delta(?float $delta): string
    {
        if ($delta === null) {
            return 'Belum ada pembanding';
        }

        return match (true) {
            $delta > 0 => '▲ +'.self::trim($delta).'%',
            $delta < 0 => '▼ '.self::trim($delta).'%',
            default => '– 0%',
        };
    }

    /** "5 Okt 2026" */
    public static function day(Carbon|string $date): string
    {
        return Carbon::parse($date)->translatedFormat('j M Y');
    }

    /** Kunci seri → label: "Senin, 5 Okt 2026" (harian) atau "Oktober 2026" (bulanan). */
    public static function bucket(string $key, string $granularity): string
    {
        return $granularity === 'day'
            ? Carbon::parse($key)->translatedFormat('D, j M Y')
            : Carbon::parse($key.'-01')->translatedFormat('F Y');
    }

    /** Label sumbu pendek: "5 Okt" atau "Okt 26". */
    public static function axis(string $key, string $granularity): string
    {
        return $granularity === 'day'
            ? Carbon::parse($key)->translatedFormat('j M')
            : Carbon::parse($key.'-01')->translatedFormat('M y');
    }

    private static function trim(float|int $value): string
    {
        return rtrim(rtrim(number_format($value, 1, ',', '.'), '0'), ',');
    }
}
