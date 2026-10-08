import EmptyState from '@/Components/eco/EmptyState';
import PageHeader from '@/Components/eco/PageHeader';
import ServiceIcon from '@/Components/eco/ServiceIcon';
import Pagination from '@/Components/Pagination';
import { PaymentBadge } from '@/Components/eco/Payment';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate, formatRupiah, formatTime, orderPrice } from '@/lib/format';
import { Reveal } from '@/lib/motion';
import { Order, PageProps, Paginated } from '@/types';
import { faCalendarDays, faChevronRight, faLocationDot, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link } from '@inertiajs/react';

// Props dari OrderController@index
export default function OrdersIndex({ orders }: PageProps<{ orders: Paginated<Order> }>) {
    return (
        <AuthenticatedLayout live={['orders']}
            header={
                <PageHeader
                    eyebrow="Pesanan Saya"
                    title="Riwayat pesanan"
                    description={`${orders.total} pesanan tercatat. Klik salah satu untuk melihat detail dan statusnya.`}
                    actions={
                        <Link href={route('services.index')} className="btn-primary">
                            <FontAwesomeIcon icon={faPlus} /> Pesan Baru
                        </Link>
                    }
                />
            }
        >
            <Head title="Pesanan Saya" />

            {orders.data.length === 0 ? (
                <div className="card">
                    <EmptyState
                        title="Belum ada pesanan"
                        description="Mulai jaga lingkungan Anda dengan memesan layanan pertama."
                        action={
                            <Link href={route('services.index')} className="btn-primary">
                                Lihat layanan
                            </Link>
                        }
                    />
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.data.map((order, i) => (
                        <Reveal key={order.id} delay={i * 50}>
                            <Link
                                href={route('orders.show', order.id)}
                                className="group flex flex-col gap-4 rounded-3xl bg-white/85 p-5 shadow-soft ring-1 ring-forest-900/5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:flex-row sm:items-center"
                            >
                                <div className="flex flex-1 items-center gap-4">
                                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-forest-900 text-leaf-400 transition group-hover:rotate-[-8deg]">
                                        <ServiceIcon name={order.service?.name ?? ''} />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-forest-900/40">#{order.id}</p>
                                        <p className="truncate font-bold">{order.service?.name}</p>
                                        <p className="mt-0.5 flex flex-wrap gap-x-4 text-sm text-forest-900/55">
                                            <span>
                                                <FontAwesomeIcon icon={faCalendarDays} className="me-1.5 text-forest-400" />
                                                {formatDate(order.date)}, {formatTime(order.time)}
                                            </span>
                                            <span className="hidden truncate md:inline">
                                                <FontAwesomeIcon icon={faLocationDot} className="me-1.5 text-forest-400" />
                                                {order.location}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-4 sm:justify-end">
                                    {orderPrice(order) && <span className="text-sm font-semibold">{formatRupiah(orderPrice(order)!)}</span>}
                                    <div className="flex flex-col items-end gap-1.5">
                                        <StatusBadge order={order} />
                                        {(order.payment || order.status === 'menunggu' || order.status === 'diproses') && <PaymentBadge payment={order.payment} />}
                                    </div>
                                    <FontAwesomeIcon icon={faChevronRight} className="hidden text-forest-900/25 transition group-hover:translate-x-1 sm:block" />
                                </div>
                            </Link>
                        </Reveal>
                    ))}
                </div>
            )}
            <Pagination meta={orders} />
        </AuthenticatedLayout>
    );
}
