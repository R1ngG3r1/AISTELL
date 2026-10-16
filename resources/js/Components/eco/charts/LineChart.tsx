import { KeyboardEvent, PointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { axisLabel, CHART_COLORS, compact, fullLabel, niceCeil, tickIndexes } from './chartUtils';

export interface LinePoint {
    key: string; // "2026-10-05" atau "2026-10"
    value: number;
    count?: number; // jumlah transaksi (tambahan di tooltip)
}

interface Props {
    data: LinePoint[];
    granularity: 'day' | 'month';
    /** Format nilai lengkap untuk tooltip dan label, mis. formatRupiah. */
    format: (value: number) => string;
    /** Nama nilai di tooltip, mis. "Pendapatan". */
    name: string;
    /** Keterangan tambahan di tooltip, mis. (n) => `${n} transaksi`. */
    countLabel?: (count: number) => string;
    height?: number;
}

const M = { top: 22, right: 18, bottom: 28, left: 46 };
const Y_TICKS = 4;

/**
 * Grafik garis satu seri: garis 2px, area ~10%, gridline hairline, crosshair + tooltip,
 * dan navigasi keyboard (panah kiri/kanan). Nilai yang tidak tampil di sumbu ada di tooltip,
 * dan seluruhnya juga tersedia lewat tampilan tabel di ChartCard.
 */
export default function LineChart({ data, granularity, format, name, countLabel, height = 240 }: Props) {
    const box = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(640);
    const [active, setActive] = useState<number | null>(null);

    useEffect(() => {
        const el = box.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => setWidth(Math.max(260, Math.round(entry.contentRect.width))));
        ro.observe(el);
        setWidth(Math.max(260, Math.round(el.clientWidth)));

        return () => ro.disconnect();
    }, []);

    const geo = useMemo(() => {
        const plotW = width - M.left - M.right;
        const plotH = height - M.top - M.bottom;
        const max = Math.max(0, ...data.map((d) => d.value));
        const top = niceCeil(max);
        const x = (i: number) => M.left + (data.length <= 1 ? plotW / 2 : (i * plotW) / (data.length - 1));
        const y = (v: number) => M.top + plotH - (v / top) * plotH;
        const points = data.map((d, i) => [x(i), y(d.value)] as const);
        const line = points.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
        const baseY = M.top + plotH;
        const area = points.length ? `${line} L${points[points.length - 1][0].toFixed(1)},${baseY} L${points[0][0].toFixed(1)},${baseY} Z` : '';
        const maxIndex = max > 0 ? data.findIndex((d) => d.value === max) : -1;

        return { plotW, plotH, top, max, x, y, points, line, area, baseY, maxIndex };
    }, [data, width, height]);

    const empty = geo.max === 0;
    const total = data.reduce((s, d) => s + d.value, 0);
    const summary = empty
        ? `${name}: tidak ada data pada periode ini.`
        : `${name}: total ${format(total)}, tertinggi ${format(geo.max)} pada ${fullLabel(data[geo.maxIndex].key, granularity)}.`;

    const nearest = (clientX: number, rect: DOMRect) => {
        const rel = clientX - rect.left - M.left;
        const idx = data.length <= 1 ? 0 : Math.round((rel / geo.plotW) * (data.length - 1));

        return Math.min(data.length - 1, Math.max(0, idx));
    };

    const onPointer = (e: PointerEvent<SVGRectElement>) => setActive(nearest(e.clientX, e.currentTarget.ownerSVGElement!.getBoundingClientRect()));

    const onKey = (e: KeyboardEvent) => {
        const last = data.length - 1;
        const keys: Record<string, number> = {
            ArrowLeft: Math.max(0, (active ?? last + 1) - 1),
            ArrowRight: Math.min(last, (active ?? -1) + 1),
            Home: 0,
            End: last,
        };
        if (e.key in keys) {
            e.preventDefault();
            setActive(keys[e.key]);
        } else if (e.key === 'Escape') setActive(null);
    };

    const yTicks = Array.from({ length: Y_TICKS + 1 }, (_, i) => (geo.top / Y_TICKS) * i);
    const xTicks = tickIndexes(data.length, Math.max(2, Math.floor(geo.plotW / 78)));
    const act = active !== null ? data[active] : null;
    const actPoint = active !== null ? geo.points[active] : null;
    // Tooltip pindah ke kiri titik bila titiknya di separuh kanan grafik, agar tidak terpotong.
    const flip = actPoint ? actPoint[0] > width / 2 : false;

    // SVG absolut: lebar wadah ditentukan induknya, bukan isinya, jadi grafik bisa menyusut di layar sempit.
    return (
        <div ref={box} className="relative w-full min-w-0 overflow-hidden" style={{ height }}>
            <svg
                width={width}
                height={height}
                role="group"
                aria-label={summary}
                tabIndex={0}
                onKeyDown={onKey}
                onFocus={() => active === null && setActive(data.length - 1)}
                onBlur={() => setActive(null)}
                className="absolute left-0 top-0 block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-forest-500/40"
            >
                {/* Gridline hairline solid + label sumbu-y */}
                {yTicks.map((t, i) => (
                    <g key={i}>
                        <line
                            x1={M.left}
                            x2={width - M.right}
                            y1={geo.y(t)}
                            y2={geo.y(t)}
                            stroke={i === 0 ? CHART_COLORS.axis : CHART_COLORS.grid}
                            strokeWidth={1}
                        />
                        <text x={M.left - 8} y={geo.y(t)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill={CHART_COLORS.muted}>
                            {compact(t)}
                        </text>
                    </g>
                ))}

                {/* Label sumbu-x, dipilih agar tidak bertabrakan */}
                {xTicks.map((i) => (
                    <text
                        key={i}
                        x={geo.x(i)}
                        y={height - 8}
                        textAnchor={i === 0 && data.length > 1 ? 'start' : i === data.length - 1 && data.length > 1 ? 'end' : 'middle'}
                        fontSize={11}
                        fill={CHART_COLORS.muted}
                    >
                        {axisLabel(data[i].key, granularity)}
                    </text>
                ))}

                {!empty && (
                    <>
                        <path d={geo.area} fill={CHART_COLORS.series} opacity={0.1} />
                        <path d={geo.line} fill="none" stroke={CHART_COLORS.series} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

                        {/* Satu label langsung pada titik tertinggi (tidak di setiap titik) */}
                        {geo.maxIndex >= 0 && active === null && (
                            <>
                                <circle cx={geo.points[geo.maxIndex][0]} cy={geo.points[geo.maxIndex][1]} r={4} fill={CHART_COLORS.series} stroke={CHART_COLORS.surface} strokeWidth={2} />
                                <text
                                    x={Math.min(width - M.right, Math.max(M.left + 24, geo.points[geo.maxIndex][0]))}
                                    y={geo.points[geo.maxIndex][1] - 11}
                                    textAnchor="middle"
                                    fontSize={11}
                                    fontWeight={600}
                                    fill="#0b0b0b"
                                >
                                    {compact(geo.max)}
                                </text>
                            </>
                        )}
                    </>
                )}

                {/* Crosshair + titik aktif dengan cincin permukaan 2px */}
                {actPoint && (
                    <>
                        <line x1={actPoint[0]} x2={actPoint[0]} y1={M.top} y2={geo.baseY} stroke={CHART_COLORS.axis} strokeWidth={1} />
                        <circle cx={actPoint[0]} cy={actPoint[1]} r={4.5} fill={CHART_COLORS.series} stroke={CHART_COLORS.surface} strokeWidth={2} />
                    </>
                )}

                {/* Area tangkap pointer selebar plot (lebih besar dari garisnya) */}
                <rect
                    x={M.left}
                    y={M.top - 8}
                    width={geo.plotW}
                    height={geo.plotH + 16}
                    fill="transparent"
                    onPointerMove={onPointer}
                    onPointerDown={onPointer}
                    onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(null)}
                />
            </svg>

            {empty && (
                <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-sm text-forest-900/45">Belum ada data pada periode ini</p>
            )}

            {act && actPoint && (
                <div
                    role="status"
                    className="pointer-events-none absolute z-10 min-w-36 rounded-xl bg-white px-3 py-2 text-sm shadow-lift ring-1 ring-forest-900/10"
                    style={{ top: Math.max(0, actPoint[1] - 70), ...(flip ? { right: width - actPoint[0] + 12 } : { left: actPoint[0] + 12 }) }}
                >
                    <p className="text-xs text-forest-900/55">{fullLabel(act.key, granularity)}</p>
                    <p className="mt-1 flex items-center gap-2">
                        <span aria-hidden className="inline-block h-0.5 w-3.5 rounded-full" style={{ background: CHART_COLORS.series }} />
                        <strong className="text-base font-bold text-forest-900">{format(act.value)}</strong>
                    </p>
                    <p className="mt-0.5 text-xs text-forest-900/60">
                        {name}
                        {countLabel && act.count !== undefined ? ` · ${countLabel(act.count)}` : ''}
                    </p>
                </div>
            )}
        </div>
    );
}
