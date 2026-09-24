import { Paginated } from '@/types';
import { Link } from '@inertiajs/react';

/** Label bawaan Laravel ("&laquo; Previous") diganti panah agar ringkas. */
const cleanLabel = (label: string) =>
    /Previous|laquo/.test(label) ? '←' : /Next|raquo/.test(label) ? '→' : label;

export default function Pagination({ meta }: { meta: Paginated<unknown> }) {
    if (meta.last_page <= 1) return null;

    return (
        <nav className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
            {meta.links.map((link, i) =>
                link.url ? (
                    <Link
                        key={i}
                        href={link.url}
                        preserveScroll
                        className={`grid h-9 min-w-9 place-items-center rounded-full px-3 text-sm font-semibold transition ${
                            link.active
                                ? 'bg-forest-900 text-cream shadow-soft'
                                : 'bg-white text-forest-900/70 ring-1 ring-forest-900/10 hover:bg-forest-50'
                        }`}
                    >
                        {cleanLabel(link.label)}
                    </Link>
                ) : (
                    <span key={i} className="grid h-9 min-w-9 place-items-center rounded-full px-3 text-sm text-forest-900/25">
                        {cleanLabel(link.label)}
                    </span>
                ),
            )}
        </nav>
    );
}
