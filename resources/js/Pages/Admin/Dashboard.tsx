import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate } from '@/lib/format';
import { Order, OrderStats, PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

// Props dari DashboardController@admin
type Props = PageProps<{ stats: OrderStats; latestOrders: Order[] }>;

export default function AdminDashboard({ stats, latestOrders }: Props) {
    const cards = [
        { label: 'Total', value: stats.total, status: '' },
        { label: 'Menunggu', value: stats.menunggu, status: 'menunggu' },
        { label: 'Diproses', value: stats.diproses, status: 'diproses' },
        { label: 'Selesai', value: stats.selesai, status: 'selesai' },
        { label: 'Ditolak', value: stats.ditolak, status: 'ditolak' },
        { label: 'Dibatalkan', value: stats.dibatalkan, status: 'dibatalkan' },
    ];

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Dashboard Admin</h2>}
        >
            <Head title="Dashboard Admin" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                        {cards.map((card) => (
                            <Link
                                key={card.label}
                                href={route('admin.orders.index', card.status ? { status: card.status } : {})}
                                className="rounded-lg bg-white p-5 shadow-sm hover:ring-2 hover:ring-indigo-200"
                            >
                                <p className="text-sm text-gray-500">{card.label}</p>
                                <p className="mt-1 text-2xl font-semibold text-gray-900">{card.value}</p>
                            </Link>
                        ))}
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="mb-4 font-semibold text-gray-900">Pesanan Terbaru</h3>
                        {latestOrders.length === 0 ? (
                            <p className="text-sm text-gray-500">Belum ada pesanan.</p>
                        ) : (
                            <ul className="divide-y">
                                {latestOrders.map((order) => (
                                    <li key={order.id} className="flex items-center justify-between py-3">
                                        <Link href={route('admin.orders.show', order.id)} className="hover:underline">
                                            <p className="font-medium text-gray-900">
                                                #{order.id} · {order.service?.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {order.user?.name} · {formatDate(order.date)}
                                            </p>
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
