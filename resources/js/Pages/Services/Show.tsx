import ServiceIcon from '@/Components/eco/ServiceIcon';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah } from '@/lib/format';
import { Reveal } from '@/lib/motion';
import { PageProps, Service } from '@/types';
import { faArrowLeft, faArrowRight, faChevronDown, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

const promises = ['Tim terlatih & terverifikasi', 'Peralatan dan bahan ramah lingkungan', 'Status pesanan bisa dipantau kapan saja'];

// Props dari ServiceController@show
export default function ServiceShow({ auth, service }: PageProps<{ service: Service }>) {
    const [open, setOpen] = useState(false);

    return (
        <AuthenticatedLayout>
            <Head title={service.name} />

            <Link href={route('services.index')} className="btn-ghost btn-sm mb-6">
                <FontAwesomeIcon icon={faArrowLeft} /> Semua layanan
            </Link>

            <Reveal
                variant="up"
                className="relative overflow-hidden rounded-[2rem] bg-forest-900 p-5 text-cream shadow-lift ring-1 ring-white/10 sm:p-7 lg:px-9 lg:py-8"
            >
                <img src="/dashboard/latarcard.jpg" alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
                <div className="relative">
                    <div className="flex items-center gap-4 sm:gap-5">
                        <span className="grid h-14 w-14 shrink-0 animate-float place-items-center rounded-2xl bg-leaf-400 text-xl text-forest-900 sm:h-16 sm:w-16 sm:rounded-3xl sm:text-2xl">
                            <ServiceIcon name={service.name} />
                        </span>
                        <h1 className="display text-3xl sm:text-4xl lg:text-5xl">{service.name}</h1>
                    </div>

                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        aria-expanded={open}
                        aria-controls="service-description"
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-cream/25 bg-forest-900/40 px-4 py-1.5 text-sm font-medium text-cream backdrop-blur-sm transition hover:bg-cream/10"
                    >
                        Detail Selengkapnya
                        <FontAwesomeIcon icon={faChevronDown} className={`text-xs transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                    </button>
                    <div
                        id="service-description"
                        className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                    >
                        <div className="overflow-hidden">
                            <div className="mt-4 rounded-2xl border border-white/20 bg-gradient-to-br from-white/15 to-forest-900/45 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)] ring-1 ring-inset ring-white/10 backdrop-blur-xl backdrop-saturate-150 sm:p-5 lg:max-w-4xl">
                                <p className="whitespace-pre-line leading-relaxed text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">{service.description}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-5 rounded-3xl bg-white/95 p-5 text-forest-900 shadow-lift backdrop-blur-md sm:px-7 sm:py-6 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-9">
                        <div>
                            <p className="text-sm text-forest-900/50">Harga Layanan</p>
                            <p className="display mt-0.5 text-4xl sm:text-[2.75rem] sm:leading-tight">{formatRupiah(service.price)}</p>
                        </div>
                        <ul className="space-y-2 border-t border-forest-900/10 pt-4 lg:border-l lg:border-t-0 lg:pl-9 lg:pt-0">
                            {promises.map((p) => (
                                <li key={p} className="flex items-center gap-3 text-sm text-forest-900/75">
                                    <FontAwesomeIcon icon={faCircleCheck} className="text-forest-500" /> {p}
                                </li>
                            ))}
                        </ul>
                        {auth.user.role === 'user' && (
                            <Link href={route('orders.create', { service: service.id })} className="btn-primary btn-lg group w-full lg:w-auto">
                                Pesan Layanan Ini
                                <FontAwesomeIcon icon={faArrowRight} className="transition-transform group-hover:translate-x-1" />
                            </Link>
                        )}
                    </div>
                </div>
            </Reveal>
        </AuthenticatedLayout>
    );
}
