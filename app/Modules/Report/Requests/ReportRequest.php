<?php

namespace App\Modules\Report\Requests;

use App\Modules\Report\Support\ReportPeriod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Throwable;

/**
 * Pilihan periode laporan dari query string: ?range=7d|30d|90d|month|year|custom&from=&to=
 * Nilai yang tidak valid diabaikan (kembali ke 30 hari terakhir), bukan error: URL laporan
 * sering di-bookmark dan bisa diedit manual.
 */
class ReportRequest extends FormRequest
{
    public const PRESETS = ['7d', '30d', '90d', 'month', 'year', 'custom'];

    public function authorize(): bool
    {
        return true; // role:admin sudah dicek di route
    }

    public function rules(): array
    {
        return [];
    }

    public function period(): ReportPeriod
    {
        $today = today();
        $range = in_array($this->param('range'), self::PRESETS, true) ? $this->param('range') : '30d';

        if ($range === 'custom') {
            $from = $this->dateParam('from');
            $to = $this->dateParam('to');

            if ($from && $to) {
                if ($from->gt($to)) {
                    [$from, $to] = [$to, $from];
                }
                // Dipotong ke batas maksimal, dihitung mundur dari tanggal akhir.
                if ($from->diffInDays($to) >= ReportPeriod::MAX_DAYS) {
                    $from = $to->copy()->subDays(ReportPeriod::MAX_DAYS - 1);
                }

                return new ReportPeriod($from, $to, 'custom');
            }

            $range = '30d';
        }

        return match ($range) {
            '7d' => new ReportPeriod($today->copy()->subDays(6), $today, '7d'),
            '90d' => new ReportPeriod($today->copy()->subDays(89), $today, '90d'),
            'month' => new ReportPeriod($today->copy()->startOfMonth(), $today, 'month'),
            'year' => new ReportPeriod($today->copy()->startOfYear(), $today, 'year'),
            default => new ReportPeriod($today->copy()->subDays(29), $today, '30d'),
        };
    }

    /** Bentuk yang dikirim ke frontend untuk mengisi ulang kolom filter. */
    public function forView(): array
    {
        $period = $this->period();

        return [
            'range' => $period->preset,
            'from' => $period->from->toDateString(),
            'to' => $period->to->toDateString(),
        ];
    }

    private function param(string $key): string
    {
        $value = $this->query($key);

        return is_string($value) ? $value : '';
    }

    private function dateParam(string $key): ?Carbon
    {
        $value = $this->param($key);

        try {
            // Carbon "meluapkan" tanggal mustahil (2026-99-99), jadi hasilnya harus sama persis dengan input.
            $date = preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) ? Carbon::createFromFormat('!Y-m-d', $value) : null;

            return $date && $date->format('Y-m-d') === $value ? $date : null;
        } catch (Throwable) {
            return null;
        }
    }
}
