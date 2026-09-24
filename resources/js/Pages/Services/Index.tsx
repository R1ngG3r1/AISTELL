import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah } from '@/lib/format';
import { PageProps, Service } from '@/types';
import { Head, Link } from '@inertiajs/react';

// Props dari ServiceController@index
export default function ServicesIndex({ auth, services }: PageProps<{ services: Service[] }>) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Layanan AISTEL</h2>}
        >
            <Head title="Layanan" />

            <div className="py-6">
                <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
                    {services.length === 0 && <p className="text-gray-500">Belum ada layanan tersedia.</p>}

                    {services.map((service) => (
                        <div key={service.id} className="flex flex-col rounded-lg bg-white p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                            <p className="mt-2 flex-1 text-sm text-gray-600">{service.description}</p>
                            <p className="mt-4 font-semibold text-indigo-700">{formatRupiah(service.price)}</p>
                            <div className="mt-4 flex gap-2">
                                <Link
                                    href={route('services.show', service.id)}
                                    className="rounded-md border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Detail
                                </Link>
                                {/* Hanya role user yang boleh memesan (PRD 13) */}
                                {auth.user.role === 'user' && (
                                    <Link
                                        href={route('orders.create', { service: service.id })}
                                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                    >
                                        Pesan
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
