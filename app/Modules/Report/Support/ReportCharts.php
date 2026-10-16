<?php

namespace App\Modules\Report\Support;

/**
 * Grafik garis untuk rekap PDF, dibuat sebagai SVG di sisi server (dompdf tidak menjalankan
 * JavaScript). Gayanya sama dengan grafik di halaman: satu seri, garis 2px, area tipis,
 * gridline hairline, dan satu label pada titik tertinggi.
 */
final class ReportCharts
{
    private const COLOR = '#328e67';

    private const GRID = '#e1e0d9';

    private const AXIS = '#c3c2b7';

    private const MUTED = '#898781';

    /**
     * @param  array<int, array{key: string, value: float|int}>  $points
     * @return string SVG sebagai data URI, siap dipakai di <img src="...">
     */
    public static function line(array $points, string $granularity, int $width = 700, int $height = 170): string
    {
        $m = ['top' => 18, 'right' => 14, 'bottom' => 24, 'left' => 54];
        $plotW = $width - $m['left'] - $m['right'];
        $plotH = $height - $m['top'] - $m['bottom'];
        $count = count($points);
        $max = $count ? max(array_column($points, 'value')) : 0;
        $top = self::niceCeil($max);

        $x = fn (int $i) => $m['left'] + ($count <= 1 ? $plotW / 2 : $i * $plotW / ($count - 1));
        $y = fn (float|int $v) => $m['top'] + $plotH - ($v / $top) * $plotH;
        $baseY = $m['top'] + $plotH;

        $svg = '';

        // Gridline hairline + label sumbu-y
        for ($i = 0; $i <= 4; $i++) {
            $value = $top / 4 * $i;
            $gy = round($y($value), 1);
            $svg .= sprintf('<line x1="%d" x2="%d" y1="%s" y2="%s" stroke="%s" stroke-width="1"/>', $m['left'], $width - $m['right'], $gy, $gy, $i === 0 ? self::AXIS : self::GRID);
            $svg .= sprintf('<text x="%d" y="%s" text-anchor="end" font-size="9" fill="%s">%s</text>', $m['left'] - 6, $gy + 3, self::MUTED, ReportFormat::compact($value));
        }

        // Label sumbu-x yang tersebar (maksimal 7), selalu termasuk yang pertama dan terakhir
        $ticks = $count <= 7 ? range(0, max(0, $count - 1)) : array_map(fn ($i) => (int) round($i * ($count - 1) / 6), range(0, 6));
        foreach ($ticks as $i) {
            if (! isset($points[$i])) {
                continue;
            }
            $anchor = $count > 1 && $i === 0 ? 'start' : ($count > 1 && $i === $count - 1 ? 'end' : 'middle');
            $svg .= sprintf('<text x="%s" y="%d" text-anchor="%s" font-size="9" fill="%s">%s</text>', round($x($i), 1), $height - 8, $anchor, self::MUTED, ReportFormat::axis($points[$i]['key'], $granularity));
        }

        if ($max <= 0) {
            $svg .= sprintf('<text x="%s" y="%s" text-anchor="middle" font-size="10" fill="%s">Tidak ada data pada periode ini</text>', $width / 2, $m['top'] + $plotH / 2, self::MUTED);
        } else {
            $coords = [];
            foreach ($points as $i => $p) {
                $coords[] = round($x($i), 1).','.round($y($p['value']), 1);
            }
            $area = implode(' ', $coords).sprintf(' %s,%d %s,%d', round($x($count - 1), 1), $baseY, round($x(0), 1), $baseY);

            $svg .= sprintf('<polygon points="%s" fill="%s" fill-opacity="0.12"/>', $area, self::COLOR);
            $svg .= sprintf('<polyline points="%s" fill="none" stroke="%s" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>', implode(' ', $coords), self::COLOR);

            // Satu label langsung pada titik tertinggi
            $maxIndex = array_search($max, array_column($points, 'value'), true);
            $mx = round($x((int) $maxIndex), 1);
            $my = round($y($max), 1);
            $svg .= sprintf('<circle cx="%s" cy="%s" r="3.5" fill="%s" stroke="#ffffff" stroke-width="1.5"/>', $mx, $my, self::COLOR);
            $svg .= sprintf('<text x="%s" y="%s" text-anchor="middle" font-size="9" font-weight="bold" fill="#0b0b0b">%s</text>', min($width - $m['right'] - 10, max($m['left'] + 14, $mx)), $my - 8, ReportFormat::compact($max));
        }

        $doc = sprintf('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d" font-family="DejaVu Sans, sans-serif">%s</svg>', $width, $height, $width, $height, $svg);

        return 'data:image/svg+xml;base64,'.base64_encode($doc);
    }

    /** Pembulatan ke atas ke angka "bulat" (1, 2, 2.5, 5, 10 × 10ⁿ) agar tick sumbu rapi. */
    private static function niceCeil(float|int $value): float
    {
        if ($value <= 0) {
            return 4; // grafik kosong: sumbu 0–4 (bilangan bulat)
        }
        $base = 10 ** floor(log10($value));
        $frac = $value / $base;
        $nice = $frac <= 1 ? 1 : ($frac <= 2 ? 2 : ($frac <= 2.5 ? 2.5 : ($frac <= 5 ? 5 : 10)));

        return $nice * $base;
    }
}
