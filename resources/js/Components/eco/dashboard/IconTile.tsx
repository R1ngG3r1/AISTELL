import { CountUp } from '@/lib/motion';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

/** Petak ikon bergaya "koleksi": ikon dalam kotak, label, dan nilai/keterangan. */
export default function IconTile({
    icon,
    label,
    value,
    href,
    iconClass = 'bg-[#eaf2e6] text-[#287e59]',
    highlight = false,
    horizontal = false,
    className = '',
}: {
    icon: IconDefinition;
    label: string;
    value?: number | string;
    href?: string;
    iconClass?: string;
    highlight?: boolean;
    horizontal?: boolean;
    className?: string;
}) {
    const cardContent = horizontal ? (
        <div
            className={`group flex h-full items-center justify-between gap-3 rounded-2xl border p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-soft ${
                highlight ? 'border-[#07271e] bg-[#07271e] text-white' : 'border-[#e1e8db] bg-[#f6f8f2] text-[#0c2b20]'
            } ${href ? '' : className}`}
        >
            <div className="flex min-w-0 items-center gap-3">
                <span
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-lg transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 ${
                        highlight ? 'bg-[#4de097]/15 text-[#4de097]' : iconClass
                    }`}
                >
                    <FontAwesomeIcon icon={icon} />
                </span>
                <span className={`text-xs font-semibold ${highlight ? 'text-white/80' : 'text-[#0c2b20]/70'}`}>{label}</span>
            </div>
            {value !== undefined && (
                <span className="shrink-0 text-2xl font-extrabold leading-none">
                    <CountUp value={value} />
                </span>
            )}
        </div>
    ) : (
        <div
            className={`group flex h-full flex-col items-center gap-2 rounded-2xl border p-3 text-center transition duration-300 hover:-translate-y-0.5 hover:shadow-soft ${
                highlight ? 'border-[#07271e] bg-[#07271e] text-white' : 'border-[#e1e8db] bg-[#f6f8f2] text-[#0c2b20]'
            } ${href ? '' : className}`}
        >
            <span
                className={`grid h-12 w-12 place-items-center rounded-2xl text-lg transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 ${
                    highlight ? 'bg-[#4de097]/15 text-[#4de097]' : iconClass
                }`}
            >
                <FontAwesomeIcon icon={icon} />
            </span>
            <span className={`text-xs font-semibold ${highlight ? 'text-white/70' : 'text-[#0c2b20]/60'}`}>{label}</span>
            {value !== undefined && (
                <span className="text-xl font-extrabold leading-none">
                    <CountUp value={value} />
                </span>
            )}
        </div>
    );

    return href ? (
        <Link href={href} className={`block h-full ${className}`}>
            {cardContent}
        </Link>
    ) : (
        cardContent
    );
}
