import Pagination from '@/Components/Pagination';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate, formatTime } from '@/lib/format';
import { Order, PageProps, Paginated } from '@/types';
import { Head, Link } from '@inertiajs/react';

// Props dari OrderController@index
export default function OrdersIndex({ orders }: PageProps<{ orders: Paginated<Order> }>) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Pesanan Saya</h2>}
        >
            <Head title="Pesanan Saya" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-4 py-3">Layanan</th>
                                    <th className="px-4 py-3">Jadwal</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {orders.data.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                                            Belum ada pesanan.{' '}
                                            <Link href={route('services.index')} className="text-indigo-600 hover:underline">
                                                Pesan layanan sekarang
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                                {orders.data.map((order) => (
                                    <tr key={order.id}>
                                        <td className="px-4 py-3 font-medium text-gray-900">{order.service?.name}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {formatDate(order.date)}, {formatTime(order.time)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge order={order} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link href={route('orders.show', order.id)} className="text-indigo-600 hover:underline">
                                                Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination meta={orders} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
