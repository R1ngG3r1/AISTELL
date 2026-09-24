import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah } from '@/lib/format';
import { PageProps, Service } from '@/types';
import { Head, Link } from '@inertiajs/react';

// Props dari ServiceController@show
export default function ServiceShow({ auth, service }: PageProps<{ service: Service }>) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{service.name}</h2>}
        >
            <Head title={service.name} />

            <div className="py-6">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <p className="whitespace-pre-line text-gray-700">{service.description}</p>
                        <p className="mt-4 text-xl font-semibold text-indigo-700">{formatRupiah(service.price)}</p>
                        <div className="mt-6 flex gap-2">
                            <Link href={route('services.index')} className="rounded-md border px-4 py-2 text-sm text-gray-700">
                                Kembali
                            </Link>
                            {auth.user.role === 'user' && (
                                <Link
                                    href={route('orders.create', { service: service.id })}
                                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                >
                                    Pesan Layanan Ini
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
