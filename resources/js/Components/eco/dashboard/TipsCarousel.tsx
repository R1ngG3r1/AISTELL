import { greenTipSlides } from '@/lib/tips';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';

const AUTOPLAY_MS = 6000;

/** Carousel Tips Hijau: foto nyata + tips statis, geser dengan panah / titik, otomatis berganti tiap 6 detik. */
export default function TipsCarousel() {
    const total = greenTipSlides.length;
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    const go = (i: number) => setIndex((i + total) % total);

    useEffect(() => {
        if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const t = window.setTimeout(() => setIndex((i) => (i + 1) % total), AUTOPLAY_MS);
        return () => window.clearTimeout(t);
    }, [index, paused, total]);

    return (
        <div
            className="flex min-w-0 flex-1 flex-col"
            role="region"
            aria-roledescription="carousel"
            aria-label="Tips Hijau"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
        >
            <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex h-full transition-transform duration-500 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
                    {greenTipSlides.map((tip, i) => (
                        <div
                            key={tip.title}
                            className="flex w-full min-w-0 shrink-0 flex-col"
                            role="group"
                            aria-roledescription="slide"
                            aria-label={`${i + 1} dari ${total}`}
                            aria-hidden={i !== index}
                        >
                            <div className="relative min-h-[11rem] flex-1 overflow-hidden rounded-2xl">
                                <img src={tip.image} alt={tip.alt} loading={i === 0 ? 'eager' : 'lazy'} className="absolute inset-0 h-full w-full object-cover" />
                                <span className="absolute left-3 top-3 rounded-full bg-[#072d23]/70 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                                    {i + 1}/{total}
                                </span>
                            </div>
                            <h3 className="mt-4 text-sm font-extrabold text-[#0c2b20]">{tip.title}</h3>
                            <p className="mt-1 text-sm leading-relaxed text-[#0c2b20]/80">{tip.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    {greenTipSlides.map((tip, i) => (
                        <button
                            key={tip.title}
                            type="button"
                            onClick={() => go(i)}
                            aria-label={`Tips ${i + 1}: ${tip.title}`}
                            aria-current={i === index}
                            className={`h-2 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-[#287e59]' : 'w-2 bg-[#0c2b20]/20 hover:bg-[#0c2b20]/40'}`}
                        />
                    ))}
                </div>
                <div className="flex gap-2">
                    {[
                        { icon: faChevronLeft, label: 'Tips sebelumnya', to: index - 1 },
                        { icon: faChevronRight, label: 'Tips berikutnya', to: index + 1 },
                    ].map((b) => (
                        <button
                            key={b.label}
                            type="button"
                            onClick={() => go(b.to)}
                            aria-label={b.label}
                            className="grid h-8 w-8 place-items-center rounded-full bg-[#eaf2e6] text-xs text-[#287e59] transition hover:bg-[#287e59] hover:text-white"
                        >
                            <FontAwesomeIcon icon={b.icon} />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
