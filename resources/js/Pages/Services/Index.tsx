import EmptyState from '@/Components/eco/EmptyState';
import PageHeader from '@/Components/eco/PageHeader';
import { RatingSummary } from '@/Components/eco/Rating';
import ServiceIcon from '@/Components/eco/ServiceIcon';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah } from '@/lib/format';
import { Reveal } from '@/lib/motion';
import { PageProps, Service } from '@/types';
import { faArrowRight, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';

// Props dari ServiceController@index
export default function ServicesIndex({ auth, services }: PageProps<{ services: Service[] }>) {
    const [query, setQuery] = useState('');
    const canOrder = auth.user.role === 'user'; // hanya role user yang boleh memesan (PRD 13)

    const filtered = useMemo(
        () =>
            services.filter((s) =>
                `${s.name} ${s.description ?? ''}`.toLowerCase().includes(query.trim().toLowerCase()),
            ),
        [services, query],
    );

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    eyebrow="Pesan Layanan"
                    title="Pilih layanan kebersihan"
                    description="Semua layanan dikerjakan tim profesional dengan metode ramah lingkungan."
                    actions={
                        <label className="relative block w-full sm:w-72">
                            <FontAwesomeIcon
                                icon={faMagnifyingGlass}
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-forest-900/35"
                            />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Cari layanan…"
                                className="input rounded-full ps-10"
                            />
                        </label>
                    }
                />
            }
        >
            <Head title="Layanan" />

            {filtered.length === 0 ? (
                <div className="card">
                    <EmptyState
                        title={services.length ? 'Layanan tidak ditemukan' : 'Belum ada layanan'}
                        description={services.length ? 'Coba kata kunci lain.' : 'Admin belum menambahkan layanan.'}
                    />
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((service, i) => (
                        <Reveal key={service.id} delay={(i % 3) * 100} variant="scale">
                            <article className="group relative flex h-full flex-col overflow-hidden rounded-4xl bg-white p-7 shadow-soft ring-1 ring-forest-900/5 transition duration-500 hover:-translate-y-1.5 hover:shadow-lift">
                                <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-leaf-100 transition-transform duration-700 group-hover:scale-150" />
                                <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-forest-900 text-xl text-leaf-400 transition duration-500 group-hover:rotate-[-10deg]">
                                    <ServiceIcon name={service.name} />
                                </span>
                                <h3 className="relative mt-6 text-xl font-bold">{service.name}</h3>
                                <p className="relative mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-forest-900/60">
                                    {service.description}
                                </p>
                                <RatingSummary avg={service.reviews_avg_rating} count={service.reviews_count} className="relative mt-3" />
                                <p className="relative mt-4 text-sm text-forest-900/50">
                                    Mulai <strong className="display text-2xl text-forest-900">{formatRupiah(service.price)}</strong>
                                </p>
                                <div className="relative mt-5 flex gap-2">
                                    <Link href={route('services.show', service.id)} className="btn-ghost flex-1">
                                        Detail
                                    </Link>
                                    {canOrder && (
                                        <Link href={route('orders.create', { service: service.id })} className="btn-primary group/btn flex-1">
                                            Pesan
                                            <FontAwesomeIcon icon={faArrowRight} className="transition-transform group-hover/btn:translate-x-1" />
                                        </Link>
                                    )}
                                </div>
                            </article>
                        </Reveal>
                    ))}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
