import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

/** Bintang hanya-baca. `value` boleh pecahan (rata-rata); bintang dibulatkan ke terdekat. */
export function Stars({ value, className = '' }: { value: number; className?: string }) {
    return (
        <span className={`inline-flex gap-0.5 ${className}`} role="img" aria-label={`Rating ${value.toFixed(1)} dari 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
                <FontAwesomeIcon key={n} icon={faStar} className={n <= Math.round(value) ? 'text-amber-400' : 'text-forest-900/15'} />
            ))}
        </span>
    );
}

/** Ringkasan "★ 4,5 (12 ulasan)"; tidak menampilkan apa pun bila belum ada ulasan. */
export function RatingSummary({ avg, count, className = '' }: { avg?: string | number | null; count?: number; className?: string }) {
    if (!count || avg == null) return null;
    const value = Number(avg);

    return (
        <span className={`inline-flex items-center gap-1.5 text-sm ${className}`}>
            <Stars value={value} />
            <strong>{value.toLocaleString('id-ID', { maximumFractionDigits: 1 })}</strong>
            <span className="opacity-60">({count} ulasan)</span>
        </span>
    );
}

const LABELS = ['', 'Sangat buruk', 'Kurang', 'Cukup', 'Bagus', 'Sangat bagus'];

/** Pemilih rating 1–5 (bisa dengan keyboard: tab ke grup lalu panah kiri/kanan). */
export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hover, setHover] = useState(0);
    const shown = hover || value;

    return (
        <div>
            <div role="radiogroup" aria-label="Rating" className="flex gap-1" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                    <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={value === n}
                        aria-label={`${n} bintang`}
                        tabIndex={value === n || (value === 0 && n === 1) ? 0 : -1}
                        onMouseEnter={() => setHover(n)}
                        onClick={() => onChange(n)}
                        onKeyDown={(e) => {
                            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onChange(Math.min(5, (value || 0) + 1));
                            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onChange(Math.max(1, (value || 2) - 1));
                        }}
                        className="rounded-lg p-1 text-3xl transition hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest-500"
                    >
                        <FontAwesomeIcon icon={faStar} className={n <= shown ? 'text-amber-400' : 'text-forest-900/15'} />
                    </button>
                ))}
            </div>
            <p className="mt-1 h-5 text-sm text-forest-900/60">{LABELS[shown]}</p>
        </div>
    );
}
