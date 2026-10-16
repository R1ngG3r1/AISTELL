<?php

namespace App\Modules\Report\Services;

use App\Modules\Report\Support\ReportCharts;
use App\Modules\Report\Support\ReportPeriod;
use Barryvdh\DomPDF\Facade\Pdf;
use Barryvdh\DomPDF\PDF as PdfDocument;

/** Rekap laporan dalam bentuk PDF (template: resources/views/reports/recap.blade.php). */
class ReportPdf
{
    public function __construct(private ReportService $reports) {}

    public function render(ReportPeriod $period): PdfDocument
    {
        $report = $this->reports->build($period);
        $g = $report['granularity'];

        return Pdf::loadView('reports.recap', [
            'period' => $period,
            'report' => $report,
            'granularity' => $g,
            'revenueChart' => ReportCharts::line($report['revenueSeries'], $g),
            'ordersChart' => ReportCharts::line($report['ordersSeries'], $g),
            // Rincian per hari/bulan: hanya baris yang ada aktivitasnya, supaya rekap tetap ringkas.
            'breakdown' => $this->breakdown($report),
            'generatedAt' => now(),
        ])->setPaper('a4');
    }

    public function filename(ReportPeriod $period): string
    {
        return $period->filename().'.pdf';
    }

    /** @return array<int, array{key: string, orders: int, transactions: int, revenue: float}> */
    private function breakdown(array $report): array
    {
        $orders = collect($report['ordersSeries'])->pluck('value', 'key');

        return collect($report['revenueSeries'])
            ->map(fn ($r) => ['key' => $r['key'], 'orders' => (int) ($orders[$r['key']] ?? 0), 'transactions' => $r['count'], 'revenue' => $r['value']])
            ->filter(fn ($r) => $r['orders'] > 0 || $r['transactions'] > 0)
            ->values()
            ->all();
    }
}
