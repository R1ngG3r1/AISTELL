import { faChartColumn, faTable } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactNode, useState } from 'react';

/**
 * Kartu grafik dengan judul dan tombol Grafik/Tabel. Tampilan tabel adalah padanan yang
 * dapat dibaca tanpa hover (dan oleh pembaca layar): semua nilai grafik ada di sana.
 */
export default function ChartCard({
    title,
    subtitle,
    chart,
    table,
    className = '',
    bodyHeight,
}: {
    title: string;
    subtitle?: string;
    /** Isi grafik; bentuk fungsi menerima `showTable` untuk berpindah ke tampilan tabel. */
    chart: ReactNode | ((showTable: () => void) => ReactNode);
    table: ReactNode;
    className?: string;
    /** Tinggi isi kartu (mis. "16rem"). Isi yang lebih panjang di-scroll di dalam kartu, kartu tidak ikut memanjang. */
    bodyHeight?: string;
}) {
    const [view, setView] = useState<'chart' | 'table'>('chart');

    return (
        <section className={`card min-w-0 p-5 md:p-6 ${className}`} aria-label={title}>
            <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                <div className="min-w-[11rem] flex-1">
                    <h2 className="font-bold text-forest-900">{title}</h2>
                    {subtitle && <p className="mt-0.5 text-xs text-forest-900/55">{subtitle}</p>}
                </div>
                <div className="flex shrink-0 rounded-full bg-forest-900/5 p-0.5 text-xs font-semibold" role="group" aria-label={`Tampilan ${title}`}>
                    {(
                        [
                            ['chart', 'Grafik', faChartColumn],
                            ['table', 'Tabel', faTable],
                        ] as const
                    ).map(([value, label, icon]) => (
                        <button
                            key={value}
                            type="button"
                            aria-pressed={view === value}
                            onClick={() => setView(value)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 transition ${view === value ? 'bg-white text-forest-900 shadow-soft' : 'text-forest-900/55 hover:text-forest-900'}`}
                        >
                            <FontAwesomeIcon icon={icon} className="text-[11px]" /> {label}
                        </button>
                    ))}
                </div>
            </header>

            <div className="mt-4" style={bodyHeight ? { height: bodyHeight } : undefined}>
                {view === 'chart' ? (
                    typeof chart === 'function' ? chart(() => setView('table')) : chart
                ) : (
                    <div className={bodyHeight ? 'h-full overflow-auto' : 'max-h-72 overflow-auto'}>{table}</div>
                )}
            </div>
        </section>
    );
}
