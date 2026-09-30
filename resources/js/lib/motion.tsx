import {
    CSSProperties,
    ElementType,
    ReactNode,
    RefObject,
    useEffect,
    useRef,
    useState,
} from 'react';

/*
| Kumpulan animasi ringan tanpa library tambahan:
|   <Reveal>      → elemen muncul halus saat di-scroll ke layar
|   useParallax() → elemen bergerak lebih lambat/cepat dari scroll (efek kedalaman)
|   <CountUp>     → angka menghitung naik saat terlihat
| Semua otomatis nonaktif jika pengguna memilih "reduce motion" di sistem operasinya.
*/

export const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** true setelah elemen masuk ke layar (sekali saja). */
export function useInView<T extends Element>(
    options: IntersectionObserverInit = { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
): [RefObject<T>, boolean] {
    const ref = useRef<T>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
            setInView(true);
            return;
        }
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setInView(true);
                observer.disconnect();
            }
        }, options);
        observer.observe(el);
        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return [ref, inView];
}

type RevealProps = {
    children: ReactNode;
    as?: ElementType;
    variant?: 'up' | 'down' | 'left' | 'right' | 'scale';
    delay?: number; // milidetik
    className?: string;
    style?: CSSProperties;
};

export function Reveal({
    children,
    as: Tag = 'div',
    variant = 'up',
    delay = 0,
    className = '',
    style,
}: RevealProps) {
    const [ref, inView] = useInView<HTMLElement>();

    return (
        <Tag
            ref={ref}
            data-variant={variant}
            className={`reveal ${inView ? 'is-visible' : ''} ${className}`}
            style={{ transitionDelay: `${delay}ms`, ...style }}
        >
            {children}
        </Tag>
    );
}

/**
 * Parallax berbasis scroll. speed positif = bergerak lebih lambat (terasa jauh),
 * negatif = berlawanan arah. Nilai wajar: -0.3 s.d. 0.3.
 */
export function useParallax<T extends HTMLElement>(speed = 0.15, axis: 'y' | 'x' = 'y', max = 90) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el || prefersReducedMotion()) return;

        let frame = 0;
        const update = () => {
            frame = 0;
            const rect = el.getBoundingClientRect();
            // Jarak pusat elemen dari pusat layar → dasar pergeseran
            const offset = rect.top + rect.height / 2 - window.innerHeight / 2;
            // Dibatasi ±max px agar elemen yang jauh dari layar tidak bergeser terlalu jauh
            const move = Math.max(-max, Math.min(max, -offset * speed));
            el.style.transform =
                axis === 'y' ? `translate3d(0, ${move.toFixed(1)}px, 0)` : `translate3d(${move.toFixed(1)}px, 0, 0)`;
        };
        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            cancelAnimationFrame(frame);
        };
    }, [speed, axis, max]);

    return ref;
}

/** Elemen pembungkus parallax, agar mudah dipakai langsung di JSX. */
export function Parallax({
    speed = 0.15,
    className = '',
    children,
}: {
    speed?: number;
    className?: string;
    children: ReactNode;
}) {
    const ref = useParallax<HTMLDivElement>(speed);
    return (
        <div ref={ref} className={`will-change-transform ${className}`}>
            {children}
        </div>
    );
}

/** Menggeser elemen mengikuti posisi kursor (efek kedalaman di hero). */
export function usePointerTilt<T extends HTMLElement>(strength = 12) {
    const ref = useRef<T>(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const el = ref.current;
        if (!el || prefersReducedMotion() || window.matchMedia('(pointer: coarse)').matches) return;
        const onMove = (e: PointerEvent) => {
            const rect = el.getBoundingClientRect();
            setPos({
                x: ((e.clientX - rect.left) / rect.width - 0.5) * strength,
                y: ((e.clientY - rect.top) / rect.height - 0.5) * strength,
            });
        };
        const onLeave = () => setPos({ x: 0, y: 0 });
        el.addEventListener('pointermove', onMove);
        el.addEventListener('pointerleave', onLeave);
        return () => {
            el.removeEventListener('pointermove', onMove);
            el.removeEventListener('pointerleave', onLeave);
        };
    }, [strength]);

    return [ref, pos] as const;
}

/** Angka yang menghitung dari 0 ke `value` saat terlihat. Mendukung akhiran, mis. "500+" / "98%". */
export function CountUp({ value, duration = 1400, className = '' }: { value: string | number; duration?: number; className?: string }) {
    const text = String(value);
    const match = text.match(/^([^\d]*)([\d.,]+)(.*)$/);
    const target = match ? Number(match[2].replace(/[.,]/g, '')) : 0;
    const [ref, inView] = useInView<HTMLSpanElement>();
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!inView || !match) return;
        if (prefersReducedMotion()) {
            setCurrent(target);
            return;
        }
        let frame = 0;
        const start = performance.now();
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
            setCurrent(Math.round(target * eased));
            if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView, target, duration]);

    if (!match) return <span className={className}>{text}</span>;

    return (
        <span ref={ref} className={`tabular-nums ${className}`}>
            {match[1]}
            {current.toLocaleString('id-ID')}
            {match[3]}
        </span>
    );
}

/** true jika halaman sudah di-scroll melewati `threshold` px (untuk navbar). */
export function useScrolled(threshold = 12) {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > threshold);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [threshold]);
    return scrolled;
}
