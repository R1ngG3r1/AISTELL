import { faLeaf } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactNode } from 'react';

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
        <div className="relative flex flex-col gap-5 overflow-hidden rounded-[28px] border border-[#dfe7d9] bg-[#fbfcf8] p-6 shadow-soft sm:p-8 md:flex-row md:items-end md:justify-between">
            {/* Ilustrasi lanskap tipis di sisi kanan, selaras dengan banner dashboard */}
            <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 md:block">
                <img src="/img-login/gambar1.jpeg" alt="" className="h-full w-full object-cover opacity-70" style={{ objectPosition: '50% 58%' }} />
                <div className="absolute inset-0 bg-gradient-to-r from-[#fbfcf8] via-[#fbfcf8]/70 to-transparent" />
            </div>

            <div className="relative animate-fade-up">
                {eyebrow && (
                    <p className="inline-flex items-center gap-2 rounded-full bg-[#287e59] px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#e8f7ee]">
                        <FontAwesomeIcon icon={faLeaf} /> {eyebrow}
                    </p>
                )}
                <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#0c2b20] md:text-4xl">{title}</h1>
                {description && <p className="mt-2 max-w-2xl text-sm text-[#4c6156] sm:text-[15px]">{description}</p>}
            </div>
            {actions && (
                <div className="relative flex shrink-0 animate-fade-up flex-wrap gap-2 [animation-delay:120ms]">{actions}</div>
            )}
        </div>
    );
}
