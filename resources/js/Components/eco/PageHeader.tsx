import { ReactNode } from 'react';
import { Leaf } from './Illustrations';

/** Judul halaman di area login: eyebrow kecil, judul besar, deskripsi, dan tombol aksi. */
export default function PageHeader({
    eyebrow,
    title,
    description,
    actions,
}: {
    eyebrow?: string;
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
}) {
    return (
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="animate-fade-up">
                {eyebrow && (
                    <p className="eyebrow">
                        <Leaf className="h-3.5 w-3.5" /> {eyebrow}
                    </p>
                )}
                <h1 className="display mt-2 text-3xl text-forest-900 md:text-4xl">{title}</h1>
                {description && <p className="mt-2 max-w-2xl text-forest-900/60">{description}</p>}
            </div>
            {actions && (
                <div className="flex shrink-0 animate-fade-up flex-wrap gap-2 [animation-delay:120ms]">{actions}</div>
            )}
        </div>
    );
}
