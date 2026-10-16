<?php

namespace App\Modules\Report\Support;

use Carbon\CarbonPeriod;
use Illuminate\Support\Carbon;

/**
 * Rentang tanggal laporan (inklusif, dari awal hari `from` sampai akhir hari `to`).
 * Grafik per hari untuk rentang pendek, per bulan untuk rentang panjang.
 */
final class ReportPeriod
{
    /** Rentang maksimal (hari). Lebih dari ini dipotong agar query dan grafik tetap ringan. */
    public const MAX_DAYS = 366;

    /** Sampai sejauh ini grafik per hari; lebih panjang jadi per bulan. */
    private const DAILY_UNTIL_DAYS = 62;

    public readonly Carbon $from;

    public readonly Carbon $to;

    public function __construct(Carbon $from, Carbon $to, public readonly string $preset = 'custom')
    {
        $this->from = $from->copy()->startOfDay();
        $this->to = $to->copy()->endOfDay();
    }

    public function days(): int
    {
        return (int) $this->from->diffInDays($this->to->copy()->startOfDay()) + 1;
    }

    /** 'day' atau 'month'. */
    public function granularity(): string
    {
        return $this->days() <= self::DAILY_UNTIL_DAYS ? 'day' : 'month';
    }

    /** Rentang sebelumnya dengan jumlah hari yang sama, tepat sebelum rentang ini (untuk pembanding). */
    public function previous(): self
    {
        $days = $this->days();

        return new self($this->from->copy()->subDays($days), $this->from->copy()->subDay(), 'previous');
    }

    /**
     * Semua kunci grafik pada rentang ini: "2026-10-05" (harian) atau "2026-10" (bulanan).
     *
     * @return array<int, string>
     */
    public function buckets(): array
    {
        if ($this->granularity() === 'day') {
            return array_map(fn (Carbon $d) => $d->toDateString(), CarbonPeriod::create($this->from, $this->to)->toArray());
        }

        return array_map(
            fn (Carbon $d) => $d->format('Y-m'),
            CarbonPeriod::create($this->from->copy()->startOfMonth(), '1 month', $this->to->copy()->startOfMonth())->toArray(),
        );
    }

    /** Kunci grafik untuk sebuah tanggal "Y-m-d". */
    public function bucketOf(string $date): string
    {
        return $this->granularity() === 'day' ? $date : substr($date, 0, 7);
    }

    /** Nama berkas ekspor, mis. "laporan-aistel_2026-10-01_sd_2026-10-31". */
    public function filename(): string
    {
        return "laporan-aistel_{$this->from->toDateString()}_sd_{$this->to->toDateString()}";
    }
}
