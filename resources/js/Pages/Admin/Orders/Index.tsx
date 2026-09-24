import Pagination from '@/Components/Pagination';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate, formatTime } from '@/lib/format';
import { Order, PageProps, Paginated, StatusOption } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

// Props dari AdminOrderController@index
type Props = PageProps<{
    orders: Paginated<Order>;
    filters: { status: string | null };
    statuses: StatusOption[];
}>;

export default function AdminOrdersIndex({ orders, filters, statuses }: Props) {
    // Ganti filter → muat ulang halaman dengan ?status=...
    const filter = (status: string) =>
        router.get(route('admin.orders.index'), status ? { status } : {}, { preserveState: true });

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Kelola Pesanan</h2>}
        >
            <Head title="Kelola Pesanan" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-4">
                        <select
                            value={filters.status ?? ''}
                            onChange={(e) => filter(e.target.value)}
                            className="rounded-md border-gray-300 text-sm shadow-sm"
                        >
                            <option value="">Semua status</option>
                            {statuses.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-4 py-3">Pemesan</th>
                                    <th className="px-4 py-3">Layanan</th>
                                    <th className="px-4 py-3">Jadwal</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {orders.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                                            Tidak ada pesanan.
                                        </td>
                                    </tr>
                                )}
                                {orders.data.map((order) => (
                                    <tr key={order.id}>
                                        <td className="px-4 py-3 text-gray-500">{order.id}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{order.contact_name}</p>
                                            <p className="text-xs text-gray-500">akun: {order.user?.email}</p>
                                        </td>
                                        <td className="px-4 py-3">{order.service?.name}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {formatDate(order.date)}, {formatTime(order.time)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge order={order} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={route('admin.orders.show', order.id)}
                                                className="text-indigo-600 hover:underline"
                                            >
                                                Kelola
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
