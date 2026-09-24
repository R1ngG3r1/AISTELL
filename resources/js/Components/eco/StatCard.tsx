import { CountUp, Reveal } from '@/lib/motion';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from '@inertiajs/react';

const tones = {
    leaf: 'bg-leaf-100 text-leaf-600',
    sun: 'bg-sun-100 text-sun-600',
    mint: 'bg-forest-50 text-forest-600',
    clay: 'bg-clay-100 text-clay-600',
    sand: 'bg-sand-200 text-forest-900/60',
};

/** Kartu statistik dengan angka yang menghitung naik dan ikon yang bergoyang saat hover. */
export default function StatCard({
    label,
    value,
    icon,
    tone = 'mint',
    href,
    delay = 0,
    highlight = false,
}: {
    label: string;
    value: number;
    icon: IconDefinition;
    tone?: keyof typeof tones;
    href?: string;
    delay?: number;
    highlight?: boolean;
}) {
    const body = (
        <div
            className={`group relative h-full overflow-hidden rounded-3xl p-5 ring-1 transition duration-300 hover:-translate-y-1 hover:shadow-lift ${
                highlight ? 'bg-forest-900 text-cream ring-white/5' : 'bg-white/85 shadow-soft ring-forest-900/5'
            }`}
        >
            <div
                className={`grid h-11 w-11 place-items-center rounded-2xl transition-transform duration-500 group-hover:rotate-[-10deg] group-hover:scale-110 ${
                    highlight ? 'bg-leaf-400 text-forest-900' : tones[tone]
                }`}
            >
                <FontAwesomeIcon icon={icon} />
            </div>
            <p className={`mt-5 text-sm font-medium ${highlight ? 'text-cream/70' : 'text-forest-900/55'}`}>{label}</p>
            <p className="display mt-1 text-4xl">
                <CountUp value={value} />
            </p>
            <div
                aria-hidden
                className={`absolute -bottom-10 -right-10 h-28 w-28 rounded-full transition-transform duration-700 group-hover:scale-150 ${
                    highlight ? 'bg-leaf-400/15' : 'bg-forest-500/5'
                }`}
            />
        </div>
    );

    return (
        <Reveal delay={delay} className="h-full">
            {href ? (
                <Link href={href} className="block h-full">
                    {body}
                </Link>
            ) : (
                body
            )}
        </Reveal>
    );
}
