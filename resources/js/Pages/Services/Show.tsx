import { Leaf } from '@/Components/eco/Illustrations';
import ServiceIcon from '@/Components/eco/ServiceIcon';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah } from '@/lib/format';
import { Parallax, Reveal } from '@/lib/motion';
import { PageProps, Service } from '@/types';
import { faArrowLeft, faArrowRight, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link } from '@inertiajs/react';

const promises = ['Tim terlatih & terverifikasi', 'Peralatan dan bahan ramah lingkungan', 'Status pesanan bisa dipantau kapan saja'];

// Props dari ServiceController@show
export default function ServiceShow({ auth, service }: PageProps<{ service: Service }>) {
    return (
        <AuthenticatedLayout>
            <Head title={service.name} />

            <Link href={route('services.index')} className="btn-ghost btn-sm mb-6">
                <FontAwesomeIcon icon={faArrowLeft} /> Semua layanan
            </Link>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                <Reveal variant="left" className="relative overflow-hidden rounded-5xl bg-forest-900 p-8 text-cream shadow-lift md:p-12">
                    <Parallax speed={0.15} className="pointer-events-none absolute -right-12 -top-12 text-forest-800">
                        <Leaf className="h-72 w-72 rotate-12" />
                    </Parallax>
                    <div className="relative">
                        <span className="grid h-16 w-16 animate-float place-items-center rounded-3xl bg-leaf-400 text-2xl text-forest-900">
                            <ServiceIcon name={service.name} />
                        </span>
                        <h1 className="display mt-8 text-4xl md:text-5xl">{service.name}</h1>
                        <p className="mt-4 whitespace-pre-line leading-relaxed text-cream/75">{service.description}</p>
                    </div>
                </Reveal>

                <Reveal variant="right" delay={100} className="card flex flex-col p-8">
                    <p className="text-sm text-forest-900/50">Harga mulai</p>
                    <p className="display mt-1 text-5xl text-forest-900">{formatRupiah(service.price)}</p>
                    <ul className="mt-8 flex-1 space-y-3">
                        {promises.map((p) => (
                            <li key={p} className="flex items-center gap-3 text-sm text-forest-900/75">
                                <FontAwesomeIcon icon={faCircleCheck} className="text-forest-500" /> {p}
                            </li>
                        ))}
                    </ul>
                    {auth.user.role === 'user' && (
                        <Link href={route('orders.create', { service: service.id })} className="btn-primary btn-lg group mt-8 w-full">
                            Pesan Layanan Ini
                            <FontAwesomeIcon icon={faArrowRight} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                    )}
                </Reveal>
            </div>
        </AuthenticatedLayout>
    );
}
