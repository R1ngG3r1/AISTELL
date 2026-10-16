import Avatar from '@/Components/eco/Avatar';
import EmptyState from '@/Components/eco/EmptyState';
import OrderCardList from '@/Components/eco/OrderCardList';
import OrderFilterBar from '@/Components/eco/OrderFilterBar';
import PageHeader from '@/Components/eco/PageHeader';
import ServiceIcon from '@/Components/eco/ServiceIcon';
import Pagination from '@/Components/Pagination';
import { PaymentBadge } from '@/Components/eco/Payment';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate, formatTime } from '@/lib/format';
import { Reveal } from '@/lib/motion';
import { Order, OrderFilters, PageProps, Paginated, StatusOption } from '@/types';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link, router } from '@inertiajs/react';

// Props dari AdminOrderController@index
type Props = PageProps<{
    orders: Paginated<Order>;
    filters: OrderFilters;
    statuses: StatusOption[];
    services: { id: number; name: string }[];
}>;

export default function AdminOrdersIndex({ orders, filters, statuses, services }: Props) {
    const current = filters.status ?? '';
    const filtered = Object.values(filters).some(Boolean);

    return (
        <AuthenticatedLayout live={['orders']}
            header={
                <PageHeader
                    eyebrow="Kelola Pesanan"
                    title="Pesanan masuk"
                    description={`${orders.total} pesanan${filtered ? ' sesuai filter' : ''}${current ? `, berstatus ${statuses.find((s) => s.value === current)?.label.toLowerCase()}` : ''}.`}
                />
            }
        >
            <Head title="Kelola Pesanan" />

            <OrderFilterBar
                routeName="admin.orders.index"
                filters={filters}
                statuses={statuses}
                services={services}
                showPayment
                searchPlaceholder="Cari nama, email, telepon, layanan, atau no. pesanan…"
            />

            <Reveal className="card overflow-hidden">
                {orders.data.length === 0 ? (
                    <EmptyState
                        title="Tidak ada pesanan"
                        description={filtered ? 'Tidak ada pesanan yang cocok. Ubah atau reset filter.' : 'Belum ada pesanan masuk.'}
                    />
                ) : (
                    <>
                    <OrderCardList orders={orders.data} className="xl:hidden" />
                    <div className="hidden overflow-x-auto xl:block">
                        <table className="table-eco">
                            <thead>
                                <tr>
                                    <th>No Layanan</th>
                                    <th>Pemesan</th>
                                    <th>Layanan</th>
                                    <th>Jadwal</th>
                                    <th>Petugas</th>
                                    <th>Status</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {orders.data.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="group cursor-pointer"
                                        onClick={() => router.visit(route('admin.orders.show', order.id))}
                                    >
                                        <td className="font-semibold text-forest-900/40">{order.id}</td>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <Avatar name={order.contact_name} src={order.user?.avatar_url} />
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold">{order.contact_name}</p>
                                                    <p className="truncate text-xs text-forest-900/45">{order.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="flex items-center gap-2 whitespace-nowrap">
                                                <ServiceIcon name={order.service?.name ?? ''} className="text-forest-500" />
                                                {order.service?.name}
                                            </span>
                                        </td>
                                        <td className="text-forest-900/60">
                                            {formatDate(order.date)}, {formatTime(order.time)}
                                        </td>
                                        <td className="whitespace-nowrap text-forest-900/60">
                                            {order.staff ? `${order.staff.name}${order.staff.type === 'tim' ? ' (Tim)' : ''}` : <span className="text-clay-600">Belum ada</span>}
                                        </td>
                                        <td>
                                            <div className="flex flex-col items-start gap-1.5">
                                                <StatusBadge order={order} />
                                                <PaymentBadge payment={order.payment} />
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <Link
                                                href={route('admin.orders.show', order.id)}
                                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-500 group-hover:text-forest-800"
                                            >
                                                Kelola <FontAwesomeIcon icon={faChevronRight} className="text-xs transition group-hover:translate-x-1" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    </>
                )}
            </Reveal>
            <Pagination meta={orders} />
        </AuthenticatedLayout>
    );
}
