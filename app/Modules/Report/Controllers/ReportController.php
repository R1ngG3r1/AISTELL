<?php

namespace App\Modules\Report\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Report\Requests\ReportRequest;
use App\Modules\Report\Services\ReportExporter;
use App\Modules\Report\Services\ReportPdf;
use App\Modules\Report\Services\ReportService;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

/** Laporan admin: ringkasan, grafik per periode, dan ekspor. */
class ReportController extends Controller
{
    public function __construct(
        private ReportService $reports,
        private ReportExporter $exporter,
        private ReportPdf $pdf,
    ) {}

    // GET /admin/reports?range=30d   (atau range=custom&from=2026-10-01&to=2026-10-31)
    public function index(ReportRequest $request): InertiaResponse
    {
        $period = $request->period();

        return Inertia::render('Admin/Reports/Index', [
            'filters' => $request->forView(),
            'report' => fn () => $this->reports->build($period),
        ]);
    }

    // GET /admin/reports/export?range=...   (CSV daftar pesanan pada periode)
    public function export(ReportRequest $request): StreamedResponse
    {
        return $this->exporter->download($request->period());
    }

    // GET /admin/reports/pdf?range=...   (rekap laporan dalam PDF)
    public function pdf(ReportRequest $request): Response
    {
        $period = $request->period();

        return $this->pdf->render($period)->download($this->pdf->filename($period));
    }
}
