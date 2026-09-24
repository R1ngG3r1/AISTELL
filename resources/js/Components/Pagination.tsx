import { Paginated } from '@/types';
import { Link } from '@inertiajs/react';

export default function Pagination({ meta }: { meta: Paginated<unknown> }) {
    if (meta.last_page <= 1) return null;

    return (
        <nav className="mt-4 flex flex-wrap gap-1">
            {meta.links.map((link, i) =>
                link.url ? (
                    <Link
                        key={i}
                        href={link.url}
                        preserveScroll
                        className={`rounded border px-3 py-1 text-sm ${
                            link.active ? 'border-indigo-600 bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span
                        key={i}
                        className="rounded border px-3 py-1 text-sm text-gray-400"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ),
            )}
        </nav>
    );
}
