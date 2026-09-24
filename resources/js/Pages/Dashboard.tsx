import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate } from '@/lib/format';
import { Order, OrderStats, PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

// Props dari DashboardController@user
type Props = PageProps<{ stats: OrderStats; latestOrders: Order[] }>;

export default function Dashboard({ auth, stats, latestOrders }: Props) {
    const cards = [
        { label: 'Total Pesanan', value: stats.total },
        { label: 'Menunggu', value: stats.menunggu },
        { label: 'Diproses', value: stats.diproses },
        { label: 'Selesai', value: stats.selesai },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Halo, {auth.user.name}
                    </h2>
                    <Link
                        href={route('services.index')}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        Pesan Layanan
                    </Link>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {cards.map((card) => (
                            <div key={card.label} className="rounded-lg bg-white p-5 shadow-sm">
                                <p className="text-sm text-gray-500">{card.label}</p>
                                <p className="mt-1 text-2xl font-semibold text-gray-900">{card.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Pesanan Terbaru</h3>
                            <Link href={route('orders.index')} className="text-sm text-indigo-600 hover:underline">
                                Lihat semua
                            </Link>
                        </div>

                        {latestOrders.length === 0 ? (
                            <p className="text-sm text-gray-500">Belum ada pesanan.</p>
                        ) : (
                            <ul className="divide-y">
                                {latestOrders.map((order) => (
                                    <li key={order.id} className="flex items-center justify-between py-3">
                                        <Link href={route('orders.show', order.id)} className="hover:underline">
                                            <p className="font-medium text-gray-900">{order.service?.name}</p>
                                            <p className="text-sm text-gray-500">{formatDate(order.date)}</p>
                                        </Link>
                                        <StatusBadge order={order} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
