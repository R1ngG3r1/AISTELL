import BarList from '@/Components/eco/charts/BarList';
import ChartCard from '@/Components/eco/charts/ChartCard';
import { fullLabel } from '@/Components/eco/charts/chartUtils';
import LineChart from '@/Components/eco/charts/LineChart';
import PageHeader from '@/Components/eco/PageHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah } from '@/lib/format';
import { Reveal } from '@/lib/motion';
import { PageProps, Report, ReportFilters, ReportMetric, ReportRange } from '@/types';
import { faArrowDown, faArrowUp, faDownload, faFilePdf, faMinus, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, router } from '@inertiajs/react';
import { ReactNode, useEffect, useState } from 'react';

// Props dari ReportController@index
type Props = PageProps<{ filters: ReportFilters; report: Report }>;

const PRESETS: { value: ReportRange; label: string; long: string }[] = [
    { value: '7d', label: '7 hari', long: '7 hari terakhir' },
    { value: '30d', label: '30 hari', long: '30 hari terakhir' },
    { value: '90d', label: '90 hari', long: '90 hari terakhir' },
    { value: 'month', label: 'Bulan ini', long: 'bulan ini' },
    { value: 'year', label: 'Tahun ini', long: 'tahun ini' },
    { value: 'custom', label: 'Kustom', long: 'periode sebelumnya' },
];

/** Kartu rincian punya tinggi tetap: hanya 5 teratas di grafik, selebihnya di tab Tabel (scroll di dalam kartu). */
const BAR_LIMIT = 5;
const BAR_BODY_HEIGHT = '16rem';

const num = (n: number, digits = 0) => n.toLocaleString('id-ID', { maximumFractionDigits: digits });
const dayLabel = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

export default function ReportsIndex({ filters, report }: Props) {
    const [loading, setLoading] = useState(false);
    const [custom, setCustom] = useState({ from: filters.from, to: filters.to });
    useEffect(() => setCustom({ from: filters.from, to: filters.to }), [filters.from, filters.to]);

    const visit = (params: Record<string, string>) =>
        router.get(route('admin.reports.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['filters', 'report'],
            onStart: () => setLoading(true),
            onFinish: () => setLoading(false),
        });

    const pickRange = (range: ReportRange) => visit(range === 'custom' ? { range, from: filters.from, to: filters.to } : { range });
    const applyCustom = (next: { from: string; to: string }) => {
        setCustom(next);
        if (next.from && next.to) visit({ range: 'custom', ...next });
    };

    const exportParams = filters.range === 'custom' ? { range: 'custom', from: filters.from, to: filters.to } : { range: filters.range };
    const previousLabel = filters.range === 'custom' || filters.range === 'month' || filters.range === 'year' ? 'periode sebelumnya' : `${PRESETS.find((p) => p.value === filters.range)?.label} sebelumnya`;
    const { summary } = report;
    const g = report.granularity;

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    eyebrow="Laporan"
                    title="Ringkasan bisnis"
                    description={`${dayLabel(filters.from)} – ${dayLabel(filters.to)}, dibandingkan dengan ${dayLabel(report.previousPeriod.from)} – ${dayLabel(report.previousPeriod.to)}.`}
                />
            }
        >
            <Head title="Laporan" />

            {/* Satu baris filter di atas semua grafik; semuanya mengikuti periode ini */}
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-wrap items-end gap-3">
                    <div role="group" aria-label="Periode" className="inline-flex flex-wrap gap-1 rounded-3xl bg-white/70 p-1 shadow-soft ring-1 ring-forest-900/5 sm:rounded-full">
                        {PRESETS.map((p) => (
                            <button
                                key={p.value}
                                type="button"
                                aria-pressed={filters.range === p.value}
                                onClick={() => pickRange(p.value)}
                                className={`whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                                    filters.range === p.value ? 'bg-forest-900 text-cream shadow-soft' : 'text-forest-900/60 hover:bg-forest-900/5'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {filters.range === 'custom' && (
                        <div className="flex items-end gap-2">
                            <label className="block">
                                <span className="mb-0.5 block text-[11px] font-semibold uppercase tracking-wider text-forest-900/40">Dari</span>
                                <input type="date" value={custom.from} max={custom.to || undefined} onChange={(e) => applyCustom({ ...custom, from: e.target.value })} className="input h-11 py-0 text-sm" />
                            </label>
                            <label className="block">
                                <span className="mb-0.5 block text-[11px] font-semibold uppercase tracking-wider text-forest-900/40">Sampai</span>
                                <input type="date" value={custom.to} min={custom.from || undefined} onChange={(e) => applyCustom({ ...custom, to: e.target.value })} className="input h-11 py-0 text-sm" />
                            </label>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-forest-900/50">Unduh:</span>
                    <a href={route('admin.reports.pdf', exportParams)} className="btn-ghost btn-sm" title="Rekap laporan periode ini dalam PDF: ringkasan, grafik, dan tabel">
                        <FontAwesomeIcon icon={faFilePdf} /> Rekap PDF
                    </a>
                    <a href={route('admin.reports.export', exportParams)} className="btn-ghost btn-sm" title="Daftar pesanan yang dibuat pada periode ini (CSV, bisa dibuka di Excel atau Google Sheets)">
                        <FontAwesomeIcon icon={faDownload} /> Data CSV
                    </a>
                </div>
            </div>

            {/* Saat memuat ulang, tampilan lama ditahan agar tidak berkedip */}
            <div className={`space-y-6 transition-opacity duration-200 ${loading ? 'opacity-60' : ''}`} aria-busy={loading}>
                {/* Angka utama */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Tile label="Pendapatan" value={formatRupiah(summary.revenue.value)} metric={summary.revenue} previousLabel={previousLabel} hint="Pembayaran lunas pada periode" delay={0} />
                    <Tile label="Pesanan masuk" value={num(summary.orders.value)} metric={summary.orders} previousLabel={previousLabel} hint="Pesanan dibuat pada periode" delay={60} />
                    <Tile label="Pesanan selesai" value={num(summary.completed.value)} metric={summary.completed} previousLabel={previousLabel} hint={`${summary.orders.value ? num((summary.completed.value / summary.orders.value) * 100, 0) : 0}% dari pesanan masuk`} delay={120} />
                    <RatingTile rating={summary.rating} previousLabel={previousLabel} delay={180} />
                </div>

                {/* Tren */}
                <div className="grid gap-6 xl:grid-cols-2">
                    <ChartCard
                        title={`Pendapatan per ${g === 'day' ? 'hari' : 'bulan'}`}
                        subtitle="Total pembayaran lunas yang diterima"
                        chart={<LineChart data={report.revenueSeries} granularity={g} format={formatRupiah} name="Pendapatan" countLabel={(n) => `${n} transaksi`} />}
                        table={
                            <DataTable
                                head={[g === 'day' ? 'Tanggal' : 'Bulan', 'Transaksi', 'Pendapatan']}
                                rows={report.revenueSeries.map((r) => [fullLabel(r.key, g), num(r.count), formatRupiah(r.value)])}
                                foot={['Total', num(report.revenueSeries.reduce((s, r) => s + r.count, 0)), formatRupiah(summary.revenue.value)]}
                            />
                        }
                    />
                    <ChartCard
                        title={`Pesanan masuk per ${g === 'day' ? 'hari' : 'bulan'}`}
                        subtitle="Jumlah pesanan yang dibuat pelanggan"
                        chart={<LineChart data={report.ordersSeries} granularity={g} format={(n) => `${num(n)} pesanan`} name="Pesanan" />}
                        table={
                            <DataTable
                                head={[g === 'day' ? 'Tanggal' : 'Bulan', 'Pesanan']}
                                rows={report.ordersSeries.map((r) => [fullLabel(r.key, g), num(r.value)])}
                                foot={['Total', num(summary.orders.value)]}
                            />
                        }
                    />
                </div>

                {/* Rincian */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <ChartCard
                        title="Pendapatan per layanan"
                        subtitle="Layanan dengan pendapatan terbesar"
                        bodyHeight={BAR_BODY_HEIGHT}
                        chart={(showTable) => <BarList rows={report.byService.map((s) => ({ name: s.name, value: s.revenue, detail: `${num(s.orders)} pesanan` }))} format={formatRupiah} empty="Belum ada pendapatan pada periode ini" limit={BAR_LIMIT} onShowAll={showTable} />}
                        table={<DataTable head={['Layanan', 'Pesanan', 'Pendapatan']} rows={report.byService.map((s) => [s.name, num(s.orders), formatRupiah(s.revenue)])} />}
                    />
                    <ChartCard
                        title="Pendapatan per metode bayar"
                        subtitle="Metode yang dipakai pelanggan"
                        bodyHeight={BAR_BODY_HEIGHT}
                        chart={(showTable) => <BarList rows={report.byMethod.map((m) => ({ name: m.name, value: m.revenue, detail: `${num(m.count)} transaksi` }))} format={formatRupiah} empty="Belum ada pembayaran pada periode ini" limit={BAR_LIMIT} onShowAll={showTable} />}
                        table={<DataTable head={['Metode', 'Transaksi', 'Pendapatan']} rows={report.byMethod.map((m) => [m.name, num(m.count), formatRupiah(m.revenue)])} />}
                    />
                    <ChartCard
                        title="Status pesanan"
                        subtitle="Kondisi pesanan yang masuk pada periode"
                        className="lg:col-span-2"
                        chart={
                            <div className="max-w-3xl">
                                <BarList rows={report.byStatus.map((s) => ({ name: s.name, value: s.value, detail: 'pesanan' }))} format={(n) => num(n)} empty="Belum ada pesanan pada periode ini" />
                            </div>
                        }
                        table={<DataTable head={['Status', 'Pesanan']} rows={report.byStatus.map((s) => [s.name, num(s.value)])} foot={['Total', num(summary.orders.value)]} />}
                    />
                </div>

                <p className="text-xs leading-relaxed text-forest-900/50">
                    Pendapatan dihitung dari pembayaran berstatus lunas yang dibayar pada periode (dana yang dikembalikan tidak ikut). Pesanan dihitung dari tanggal pesanan dibuat, dengan status saat ini. Rekap PDF memuat seluruh halaman ini; Data CSV berisi daftar pesanan yang dibuat pada periode.
                </p>
            </div>
        </AuthenticatedLayout>
    );
}

/* -------------------------------------------------------------------------- */

/** Selisih terhadap periode sebelumnya: panah + angka + teks (bukan warna saja). */
function Delta({ delta, previousLabel }: { delta: number | null; previousLabel: string }) {
    if (delta === null) {
        return <span className="text-xs text-forest-900/45">Belum ada pembanding {previousLabel}</span>;
    }
    const flat = delta === 0;
    const up = delta > 0;

    return (
        <span className="inline-flex flex-wrap items-center gap-x-1.5 text-xs">
            <span className={`inline-flex items-center gap-1 font-bold ${flat ? 'text-forest-900/55' : up ? 'text-[#006300]' : 'text-clay-600'}`}>
                <FontAwesomeIcon icon={flat ? faMinus : up ? faArrowUp : faArrowDown} className="text-[10px]" />
                {up ? '+' : ''}
                {num(delta, 1)}%
            </span>
            <span className="text-forest-900/50">dari {previousLabel}</span>
        </span>
    );
}

function Tile({ label, value, metric, previousLabel, hint, delay }: { label: string; value: string; metric: ReportMetric; previousLabel: string; hint: string; delay: number }) {
    return (
        <Reveal delay={delay} className="card p-5">
            <p className="text-sm font-semibold text-forest-900/60">{label}</p>
            <p className="display mt-1.5 text-3xl text-forest-900">{value}</p>
            <div className="mt-2 space-y-0.5">
                <Delta delta={metric.delta} previousLabel={previousLabel} />
                <p className="text-xs text-forest-900/45">{hint}</p>
            </div>
        </Reveal>
    );
}

function RatingTile({ rating, previousLabel, delay }: { rating: Report['summary']['rating']; previousLabel: string; delay: number }) {
    const diff = rating.value !== null && rating.previous !== null ? Math.round((rating.value - rating.previous) * 10) / 10 : null;

    return (
        <Reveal delay={delay} className="card p-5">
            <p className="text-sm font-semibold text-forest-900/60">Rating pelanggan</p>
            <p className="display mt-1.5 flex items-baseline gap-2 text-3xl text-forest-900">
                {rating.value === null ? '-' : num(rating.value, 1)}
                {rating.value !== null && <FontAwesomeIcon icon={faStar} className="text-xl text-amber-400" />}
            </p>
            <div className="mt-2 space-y-0.5">
                {diff === null ? (
                    <span className="text-xs text-forest-900/45">Belum ada pembanding {previousLabel}</span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs">
                        <span className={`inline-flex items-center gap-1 font-bold ${diff === 0 ? 'text-forest-900/55' : diff > 0 ? 'text-[#006300]' : 'text-clay-600'}`}>
                            <FontAwesomeIcon icon={diff === 0 ? faMinus : diff > 0 ? faArrowUp : faArrowDown} className="text-[10px]" />
                            {diff > 0 ? '+' : ''}
                            {num(diff, 1)}
                        </span>
                        <span className="text-forest-900/50">dari {previousLabel}</span>
                    </span>
                )}
                <p className="text-xs text-forest-900/45">{rating.count ? `Dari ${num(rating.count)} ulasan` : 'Belum ada ulasan pada periode ini'}</p>
            </div>
        </Reveal>
    );
}

/** Tabel padanan grafik: semua nilai bisa dibaca tanpa hover. */
function DataTable({ head, rows, foot }: { head: string[]; rows: ReactNode[][]; foot?: ReactNode[] }) {
    return (
        <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
                <tr className="border-b border-forest-900/10 text-left text-xs uppercase tracking-wider text-forest-900/45">
                    {head.map((h, i) => (
                        <th key={h} className={`py-2 pr-3 font-semibold ${i > 0 ? 'text-right' : ''}`}>
                            {h}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, r) => (
                    <tr key={r} className="border-b border-forest-900/5">
                        {row.map((cell, i) => (
                            <td key={i} className={`py-2 pr-3 ${i > 0 ? 'text-right tabular-nums' : ''}`}>
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
                {rows.length === 0 && (
                    <tr>
                        <td colSpan={head.length} className="py-6 text-center text-forest-900/45">
                            Belum ada data pada periode ini
                        </td>
                    </tr>
                )}
            </tbody>
            {foot && (
                <tfoot>
                    <tr className="font-bold">
                        {foot.map((cell, i) => (
                            <td key={i} className={`pt-2.5 pr-3 ${i > 0 ? 'text-right tabular-nums' : ''}`}>
                                {cell}
                            </td>
                        ))}
                    </tr>
                </tfoot>
            )}
        </table>
    );
}
