import { useParallax } from '@/lib/motion';
import { CSSProperties, SVGAttributes } from 'react';

/*
| Aset visual AISTEL dalam bentuk SVG (tanpa file gambar eksternal).
| Semua warna memakai palet di tailwind.config.js.
*/

/** Daun tunggal dengan tulang daun. */
export function Leaf({ className = '', style, ...props }: SVGAttributes<SVGElement> & { style?: CSSProperties }) {
    return (
        <svg viewBox="0 0 48 48" fill="none" className={className} style={style} aria-hidden {...props}>
            <path d="M24 3C12 10 7 22 10 34c2 7 7 11 14 11s12-4 14-11C41 22 36 10 24 3z" fill="currentColor" />
            <path d="M24 12v31M24 24l-6-5M24 31l7-6M24 38l-5-4" stroke="rgba(7,45,35,.28)" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    );
}

/** Logo AISTEL: daun di kotak membulat + nama. */
export function LogoMark({ className = '', light = false }: { className?: string; light?: boolean }) {
    return (
        <span className={`inline-flex items-center gap-2.5 ${className}`}>
            <span
                className={`grid h-9 w-9 place-items-center rounded-xl shadow-soft transition-transform duration-500 group-hover:rotate-[-8deg] ${
                    light ? 'bg-leaf-400 text-forest-900' : 'bg-forest-900 text-leaf-400'
                }`}
            >
                <Leaf className="h-5 w-5" />
            </span>
            <span className={`font-display text-xl font-bold tracking-tight ${light ? 'text-cream' : 'text-forest-900'}`}>
                AISTEL
            </span>
        </span>
    );
}

/** Blob organik yang perlahan berubah bentuk. */
export function Blob({ className = '' }: { className?: string }) {
    return <div aria-hidden className={`pointer-events-none absolute animate-blob blur-2xl ${className}`} />;
}

/** Daun-daun yang melayang jatuh (dekorasi latar). */
export function FloatingLeaves({ count = 7, className = '' }: { count?: number; className?: string }) {
    const colors = ['text-leaf-400', 'text-forest-300', 'text-leaf-300', 'text-forest-400'];
    return (
        <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
                <Leaf
                    key={i}
                    className={`absolute top-0 animate-drift opacity-0 ${colors[i % colors.length]}`}
                    style={{
                        left: `${(i * 97) % 100}%`,
                        width: `${14 + ((i * 7) % 16)}px`,
                        animationDelay: `${i * 2.1}s`,
                        animationDuration: `${12 + ((i * 5) % 9)}s`,
                    }}
                />
            ))}
        </div>
    );
}

/** Garis gelombang untuk transisi antar-section. */
export function Wave({ className = '', flip = false }: { className?: string; flip?: boolean }) {
    return (
        <svg
            viewBox="0 0 1440 90"
            preserveAspectRatio="none"
            className={`block h-12 w-full md:h-20 ${flip ? 'rotate-180' : ''} ${className}`}
            aria-hidden
        >
            <path d="M0 40c160 40 320 50 480 30S800 0 960 10s320 60 480 50v30H0z" fill="currentColor" />
        </svg>
    );
}

/* ----------------------------------------------------------------------------
 | Lanskap hero berlapis. Setiap lapisan punya kecepatan parallax berbeda,
 | sehingga saat halaman di-scroll terlihat efek kedalaman.
 * ------------------------------------------------------------------------- */

function Layer({ speed, children }: { speed: number; children: React.ReactNode }) {
    const ref = useParallax<HTMLDivElement>(speed);
    return (
        <div ref={ref} className="absolute inset-0 will-change-transform">
            <svg viewBox="0 0 600 640" preserveAspectRatio="xMidYMax slice" className="h-full w-full" overflow="visible">
                {children}
            </svg>
        </div>
    );
}

export function HeroScene({ className = '' }: { className?: string }) {
    return (
        <div className={`relative overflow-hidden bg-gradient-to-b from-[#eaf4e3] via-forest-100 to-forest-200 ${className}`}>
            {/* Matahari */}
            <Layer speed={0.22}>
                <circle cx="420" cy="170" r="120" fill="#ecf6d2" opacity=".6" />
                <circle cx="420" cy="170" r="78" fill="#dcedb0" />
                <circle cx="420" cy="170" r="52" fill="#c7e188" />
            </Layer>

            {/* Awan */}
            <Layer speed={0.3}>
                <g fill="#fff" opacity=".85">
                    <rect x="70" y="120" width="130" height="30" rx="15" />
                    <rect x="100" y="100" width="70" height="34" rx="17" />
                    <rect x="330" y="260" width="110" height="24" rx="12" opacity=".7" />
                </g>
            </Layer>

            {/* Bukit jauh */}
            <Layer speed={0.16}>
                <path d="M-40 380C60 320 140 330 230 360s170 10 250-40 140-20 170 0V900H-40z" fill="#b0d6c1" />
            </Layer>

            {/* Bukit tengah + pepohonan + rumah */}
            <Layer speed={0.09}>
                <path d="M-40 450c90-60 190-70 290-30s180 40 260-10 110-30 130-20V900H-40z" fill="#52a07b" />
                {[
                    [70, 430, 1],
                    [120, 415, 1.3],
                    [470, 412, 1.1],
                    [520, 425, 0.9],
                ].map(([x, y, s], i) => (
                    <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
                        <rect x="-3" y="0" width="6" height="26" rx="3" fill="#103f2f" />
                        <circle cx="0" cy="-8" r="20" fill="#247352" />
                        <circle cx="-9" cy="2" r="13" fill="#328e67" />
                    </g>
                ))}
                {/* Rumah */}
                <g transform="translate(270 378)">
                    <rect x="0" y="30" width="80" height="58" rx="6" fill="#f7f8f3" />
                    <path d="M-10 36L40 -4l50 40z" fill="#072d23" />
                    <rect x="32" y="56" width="18" height="32" rx="4" fill="#b4d96f" />
                    <rect x="10" y="46" width="14" height="14" rx="3" fill="#80bb9c" />
                    <rect x="58" y="46" width="14" height="14" rx="3" fill="#80bb9c" />
                </g>
            </Layer>

            {/* Bukit dekat */}
            <Layer speed={0.04}>
                <path d="M-40 540c120-50 240-40 340-10s200 20 340-30V900H-40z" fill="#1b5b42" />
                {/* Rumput */}
                <g stroke="#b4d96f" strokeWidth="4" strokeLinecap="round" fill="none">
                    <path d="M80 548q4-18 10-24M88 550q2-14-2-26M96 548q6-14 14-18" />
                    <path d="M470 528q4-18 10-24M478 530q2-14-2-26M486 528q6-14 14-18" />
                </g>
            </Layer>

            {/* Latar depan */}
            <Layer speed={-0.02}>
                <path d="M-40 600c150-30 300-30 450-5s160 5 230-10V900H-40z" fill="#072d23" />
            </Layer>

            <FloatingLeaves count={6} />
        </div>
    );
}

/** Pot tanaman kecil - untuk state kosong & halaman error. */
export function Sprout({ className = '', wilted = false }: { className?: string; wilted?: boolean }) {
    return (
        <svg viewBox="0 0 160 160" className={className} aria-hidden>
            <ellipse cx="80" cy="146" rx="48" ry="6" fill="#072d23" opacity=".08" />
            <g className={wilted ? '' : 'origin-bottom animate-sway'} style={{ transformOrigin: '80px 98px' }}>
                <path d="M80 98V52" stroke="#247352" strokeWidth="5" strokeLinecap="round" />
                <path
                    d={wilted ? 'M80 70c-18 4-30 16-34 32 16 0 28-10 34-32z' : 'M80 66c-20-2-34-14-38-32 20-2 34 10 38 32z'}
                    fill="#52a07b"
                />
                <path
                    d={wilted ? 'M80 62c16 6 24 20 24 36-14-4-22-16-24-36z' : 'M80 58c16-12 34-14 44-6-8 16-26 20-44 6z'}
                    fill="#b4d96f"
                />
            </g>
            <path d="M50 96h60l-8 46a6 6 0 0 1-6 5H64a6 6 0 0 1-6-5z" fill="#d9764a" />
            <rect x="44" y="90" width="72" height="12" rx="6" fill="#c05f35" />
        </svg>
    );
}
