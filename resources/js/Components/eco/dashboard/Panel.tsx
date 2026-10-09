import { Reveal } from '@/lib/motion';
import { faLeaf } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

/** Kartu krem dashboard dengan judul berikon daun dan tautan "Lihat semua" opsional. */
export default function Panel({
    title,
    action,
    children,
    className = '',
    bodyClassName = '',
    delay = 0,
}: {
    title: ReactNode;
    action?: { label: string; href: string };
    children: ReactNode;
    className?: string;
    bodyClassName?: string;
    delay?: number;
}) {
    return (
        <Reveal delay={delay} className={`card flex min-w-0 flex-col p-5 sm:p-6 ${className}`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <h2 className="flex items-center gap-2.5 text-[15px] font-extrabold text-[#0c2b20]">
                    <FontAwesomeIcon icon={faLeaf} className="text-[#287e59]" />
                    {title}
                </h2>
                {action && (
                    <Link
                        href={action.href}
                        className="shrink-0 rounded-full bg-[#eaf2e6] px-3 py-1 text-xs font-bold text-[#287e59] transition hover:bg-[#287e59] hover:text-white"
                    >
                        {action.label}
                    </Link>
                )}
            </div>
            <div className={`flex-1 ${bodyClassName}`}>{children}</div>
        </Reveal>
    );
}
