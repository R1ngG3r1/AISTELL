import { faClock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const ITEM = 40; // tinggi satu baris (px)
const VISIBLE = 5; // jumlah baris terlihat
const PAD = ((VISIBLE - 1) / 2) * ITEM;

export const ZONES = ['WIB', 'WITA', 'WIT'] as const;
export type Zone = (typeof ZONES)[number];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

/** Satu kolom gulir dengan efek "snap" ke tengah, seperti pemilih waktu di ponsel. */
function WheelColumn({ items, value, onSelect, label }: { items: readonly string[]; value: string; onSelect: (v: string) => void; label: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const timer = useRef<ReturnType<typeof setTimeout>>();
    const index = Math.max(0, items.indexOf(value));

    // Posisikan ke nilai terpilih saat dibuka / nilai berubah dari luar.
    useEffect(() => {
        const el = ref.current;
        if (el && Math.round(el.scrollTop / ITEM) !== index) el.scrollTop = index * ITEM;
    }, [index]);

    const handleScroll = () => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            const el = ref.current;
            if (!el) return;
            const i = Math.min(items.length - 1, Math.max(0, Math.round(el.scrollTop / ITEM)));
            if (items[i] !== value) onSelect(items[i]);
        }, 90);
    };

    return (
        <div
            ref={ref}
            onScroll={handleScroll}
            role="listbox"
            aria-label={label}
            className="relative z-10 flex-1 snap-y snap-mandatory overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ height: ITEM * VISIBLE, paddingTop: PAD, paddingBottom: PAD }}
        >
            {items.map((item, i) => {
                const dist = Math.abs(i - index);
                return (
                    <button
                        key={item}
                        type="button"
                        role="option"
                        aria-selected={i === index}
                        onClick={() => ref.current?.scrollTo({ top: i * ITEM, behavior: 'smooth' })}
                        className={`flex w-full snap-center items-center justify-center text-lg tabular-nums transition ${
                            dist === 0 ? 'font-bold text-forest-900' : dist === 1 ? 'text-forest-900/60' : 'text-forest-900/25'
                        }`}
                        style={{ height: ITEM }}
                    >
                        {item}
                    </button>
                );
            })}
        </div>
    );
}

type Props = {
    id?: string;
    /** Format "HH:mm", kosong bila belum dipilih. */
    value: string;
    zone: Zone;
    onChange: (time: string) => void;
    onZoneChange: (zone: Zone) => void;
};

/** Pemilih waktu gaya roda gulir: jam : menit + zona waktu Indonesia (WIB/WITA/WIT). */
export default function TimeWheel({ id, value, zone, onChange, onZoneChange }: Props) {
    const [open, setOpen] = useState(false);
    const box = useRef<HTMLDivElement>(null);
    const panel = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
    const [hour, minute] = value ? value.split(':') : ['08', '00'];

    // Panel dirender di <body> agar tidak tertutup kartu/section lain (stacking context).
    useLayoutEffect(() => {
        if (!open) return;
        const place = () => {
            const r = box.current?.getBoundingClientRect();
            if (r) setPos({ top: r.bottom + window.scrollY + 8, left: r.left + window.scrollX, width: r.width });
        };
        place();
        window.addEventListener('resize', place);
        return () => window.removeEventListener('resize', place);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const close = (e: MouseEvent) => {
            const t = e.target as Node;
            if (!box.current?.contains(t) && !panel.current?.contains(t)) setOpen(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [open]);

    const toggle = () => {
        if (!open && !value) onChange('08:00');
        setOpen((o) => !o);
    };

    return (
        <div ref={box} className="relative">
            <button id={id} type="button" onClick={toggle} aria-haspopup="dialog" aria-expanded={open} className="input flex items-center justify-between text-left">
                <span className={value ? '' : 'text-forest-900/35'}>{value ? `${value} ${zone}` : '--:-- WIB'}</span>
                <FontAwesomeIcon icon={faClock} className="text-forest-900/40" />
            </button>

            {open &&
                createPortal(
                <div
                    ref={panel}
                    role="dialog"
                    aria-label="Pilih waktu"
                    className="absolute z-[100] min-w-[260px] rounded-2xl bg-white p-4 shadow-lift ring-1 ring-forest-900/10"
                    style={{ top: pos.top, left: pos.left, width: pos.width }}
                >
                    <p className="mb-2 text-center text-sm font-bold">Waktu</p>
                    <div className="relative">
                        {/* Pita penanda baris terpilih */}
                        <div className="pointer-events-none absolute inset-x-0 rounded-xl bg-forest-900/[0.06]" style={{ top: PAD, height: ITEM }} />
                        <div
                            className="flex items-center"
                            style={{ maskImage: 'linear-gradient(transparent, #000 30%, #000 70%, transparent)', WebkitMaskImage: 'linear-gradient(transparent, #000 30%, #000 70%, transparent)' }}
                        >
                            <WheelColumn label="Jam" items={HOURS} value={hour} onSelect={(h) => onChange(`${h}:${minute}`)} />
                            <span className="relative z-10 text-lg font-bold">:</span>
                            <WheelColumn label="Menit" items={MINUTES} value={minute} onSelect={(m) => onChange(`${hour}:${m}`)} />
                            <WheelColumn label="Zona waktu" items={ZONES} value={zone} onSelect={(z) => onZoneChange(z as Zone)} />
                        </div>
                    </div>
                    <button type="button" onClick={() => setOpen(false)} className="btn-primary mt-3 w-full">
                        Selesai
                    </button>
                </div>,
                document.body,
                )}
        </div>
    );
}
