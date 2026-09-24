import { Blob, FloatingLeaves, HeroScene, Leaf, LogoMark } from '@/Components/eco/Illustrations';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from '@inertiajs/react';
import { PropsWithChildren, ReactNode } from 'react';

/**
 * Layout halaman tamu (login, register, lupa password, dst).
 * Kiri: panel ilustrasi parallax (disembunyikan di layar kecil). Kanan: form.
 */
export default function Guest({
    children,
    title,
    subtitle,
}: PropsWithChildren<{ title?: ReactNode; subtitle?: ReactNode }>) {
    return (
        <div className="relative flex min-h-screen overflow-x-clip bg-cream">
            {/* Panel ilustrasi */}
            <aside className="relative hidden w-[46%] overflow-hidden bg-forest-900 lg:block">
                <div className="absolute inset-0 opacity-90">
                    <HeroScene className="h-full w-full" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-900/40 to-transparent" />
                <div className="relative flex h-full flex-col justify-between p-12 text-cream">
                    <Link href="/" className="group w-fit">
                        <LogoMark light />
                    </Link>
                    <div className="max-w-md animate-fade-up">
                        <p className="eyebrow text-leaf-400">
                            <Leaf className="h-3.5 w-3.5" /> Eco living, dimulai dari sini
                        </p>
                        <h2 className="display mt-3 text-4xl leading-tight xl:text-5xl">
                            Lingkungan bersih, <em className="text-leaf-400">hidup lebih tenang.</em>
                        </h2>
                        <ul className="mt-6 space-y-2.5 text-sm text-cream/80">
                            {['Pesan layanan kebersihan dalam hitungan menit', 'Pantau status pesanan kapan saja', 'Tim profesional & ramah lingkungan'].map((t) => (
                                <li key={t} className="flex items-center gap-2.5">
                                    <FontAwesomeIcon icon={faCircleCheck} className="text-leaf-400" /> {t}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </aside>

            {/* Form */}
            <main className="relative flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
                <Blob className="-right-24 -top-24 h-80 w-80 bg-leaf-200/60" />
                <Blob className="-bottom-32 -left-24 h-80 w-80 bg-forest-100/70 [animation-delay:-5s]" />
                <FloatingLeaves count={4} className="lg:hidden" />

                <div className="relative w-full max-w-md">
                    <Link href="/" className="group mb-8 inline-block lg:hidden">
                        <LogoMark />
                    </Link>
                    {title && (
                        <div className="mb-7 animate-fade-up">
                            <h1 className="display text-3xl text-forest-900 sm:text-4xl">{title}</h1>
                            {subtitle && <p className="mt-2 text-forest-900/60">{subtitle}</p>}
                        </div>
                    )}
                    <div className="animate-fade-up rounded-4xl bg-white/85 p-6 shadow-lift ring-1 ring-forest-900/5 backdrop-blur [animation-delay:80ms] sm:p-8">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
