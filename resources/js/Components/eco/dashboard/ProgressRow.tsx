import { useInView } from '@/lib/motion';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from '@inertiajs/react';

/** Baris progres: ikon, label, "nilai / maks", dan bar yang tumbuh saat terlihat. */
export default function ProgressRow({
    icon,
    label,
    value,
    max,
    barClass = 'bg-[#287e59]',
    iconClass = 'bg-[#eaf2e6] text-[#287e59]',
    href,
    delay = 0,
}: {
    icon: IconDefinition;
    label: string;
    value: number;
    max: number;
    barClass?: string;
    iconClass?: string;
    href?: string;
    delay?: number;
}) {
    const [ref, visible] = useInView<HTMLDivElement>();
    const percent = max > 0 ? Math.round((value / max) * 100) : 0;

    const body = (
        <div ref={ref} className="group flex items-center gap-3">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm ${iconClass}`}>
                <FontAwesomeIcon icon={icon} />
            </span>
            <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-baseline justify-between gap-2 text-[13px]">
                    <span className="truncate font-semibold text-[#0c2b20]/80 group-hover:text-[#0c2b20]">{label}</span>
                    <span className="shrink-0 font-bold tabular-nums text-[#0c2b20]">
                        {value} <span className="font-medium text-[#0c2b20]/40">/ {max}</span>
                    </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#e4ebde]">
                    <div
                        className={`h-full origin-left rounded-full ${barClass} ${visible ? 'animate-grow' : 'scale-x-0'}`}
                        style={{ width: `${percent}%`, animationDelay: `${delay}ms` }}
                    />
                </div>
            </div>
        </div>
    );

    return href ? (
        <Link href={href} className="-mx-2 block rounded-xl px-2 py-1 transition hover:bg-[#eef4ea]">
            {body}
        </Link>
    ) : (
        <div className="py-1">{body}</div>
    );
}
