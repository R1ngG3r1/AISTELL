import { useState } from 'react';
import { CHART_COLORS } from './chartUtils';

export interface BarRow {
    name: string;
    value: number;
    /** Keterangan tambahan di tooltip, mis. "12 pesanan". */
    detail?: string;
}

/** Ruang yang disisakan di kanan untuk nilai di ujung batang (cukup untuk "Rp 99.999.999"). */
const VALUE_ROOM = '7.5rem';

/**
 * Grafik batang horizontal satu seri: satu warna untuk semua batang (kategori nominal tidak diberi
 * gradasi), tebal maksimal 24px, ujung data membulat 4px dan dasarnya rata, nilai tepat di ujung batang.
 * Batang terpanjang berhenti sebelum ruang nilai, sehingga label tidak pernah meluber dari kartu.
 * Setiap batang punya tooltip saat hover maupun fokus keyboard.
 */
export default function BarList({
    rows,
    format,
    empty = 'Belum ada data pada periode ini',
    limit,
    onShowAll,
}: {
    rows: BarRow[];
    format: (v: number) => string;
    empty?: string;
    /** Tampilkan hanya sekian baris teratas (baris harus sudah terurut); sisanya lewat `onShowAll`. */
    limit?: number;
    /** Dipanggil saat "lihat semua" ditekan, biasanya membuka tampilan tabel. */
    onShowAll?: () => void;
}) {
    const [active, setActive] = useState<number | null>(null);
    const max = Math.max(0, ...rows.map((r) => r.value));
    const hidden = limit !== undefined ? Math.max(0, rows.length - limit) : 0;
    const shownRows = limit !== undefined ? rows.slice(0, limit) : rows;

    if (rows.length === 0 || max === 0) {
        return <p className="py-10 text-center text-sm text-forest-900/45">{empty}</p>;
    }

    return (
        <ul className="space-y-2.5" onPointerLeave={() => setActive(null)}>
            {shownRows.map((r, i) => {
                const ratio = r.value / max;
                const shown = active === i;

                return (
                    <li key={r.name} className="relative">
                        <div
                            tabIndex={0}
                            role="img"
                            aria-label={`${r.name}: ${format(r.value)}${r.detail ? `, ${r.detail}` : ''}`}
                            onPointerEnter={() => setActive(i)}
                            onFocus={() => setActive(i)}
                            onBlur={() => setActive(null)}
                            className="grid grid-cols-[minmax(0,6.5rem)_1fr] items-center gap-3 rounded-lg py-1 outline-none focus-visible:ring-2 focus-visible:ring-forest-500/40 sm:grid-cols-[minmax(0,8rem)_1fr]"
                        >
                            <span className="truncate text-sm text-forest-900/80" title={r.name}>
                                {r.name}
                            </span>
                            <span className="flex h-6 items-center">
                                <span
                                    className="block h-5 shrink-0 rounded-r-[4px] transition-opacity duration-300"
                                    style={{
                                        width: `calc((100% - ${VALUE_ROOM}) * ${ratio})`,
                                        minWidth: r.value > 0 ? 4 : 0,
                                        background: CHART_COLORS.series,
                                        opacity: active === null || shown ? 1 : 0.55,
                                    }}
                                />
                                <span className="whitespace-nowrap pl-2 text-sm font-semibold text-forest-900">{format(r.value)}</span>
                            </span>
                        </div>
                        {shown && r.detail && (
                            <div role="status" className="pointer-events-none absolute right-0 top-full z-10 mt-0.5 rounded-xl bg-white px-3 py-2 text-sm shadow-lift ring-1 ring-forest-900/10">
                                <p className="flex items-center gap-2">
                                    <span aria-hidden className="inline-block h-0.5 w-3.5 rounded-full" style={{ background: CHART_COLORS.series }} />
                                    <strong className="font-bold">{format(r.value)}</strong>
                                </p>
                                <p className="mt-0.5 text-xs text-forest-900/60">
                                    {r.name} · {r.detail}
                                </p>
                            </div>
                        )}
                    </li>
                );
            })}
            {hidden > 0 && (
                <li>
                    <button type="button" onClick={onShowAll} className="text-xs font-semibold text-forest-600 hover:underline">
                        +{hidden} lainnya · lihat semua di Tabel
                    </button>
                </li>
            )}
        </ul>
    );
}
