import Avatar from '@/Components/eco/Avatar';
import ConfirmModal from '@/Components/eco/ConfirmModal';
import OrderTimeline from '@/Components/eco/OrderTimeline';
import ServiceIcon from '@/Components/eco/ServiceIcon';
import InputError from '@/Components/InputError';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate, formatRupiah, formatTime, orderPrice } from '@/lib/format';
import { Reveal } from '@/lib/motion';
import { Order, OrderStatus, PageProps, StatusOption } from '@/types';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
    faArrowLeft,
    faBan,
    faCalendarDays,
    faCheck,
    faClock,
    faEnvelope,
    faHourglassHalf,
    faLocationDot,
    faLock,
    faNoteSticky,
    faPhone,
    faUser,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

// Props dari AdminOrderController@show
type Props = PageProps<{ order: Order; allowedStatuses: StatusOption[] }>;

// Tampilan tombol untuk setiap status tujuan.
const actions: Record<OrderStatus, { text: string; className: string; icon: IconDefinition; tone: 'primary' | 'danger' }> = {
    diproses: { text: 'Terima Pesanan', className: 'btn-leaf', icon: faHourglassHalf, tone: 'primary' },
    selesai: { text: 'Tandai Selesai', className: 'btn bg-white text-forest-900 shadow-soft hover:bg-cream', icon: faCheck, tone: 'primary' },
    ditolak: { text: 'Tolak', className: 'btn-danger', icon: faXmark, tone: 'danger' },
    dibatalkan: { text: 'Batalkan', className: 'btn-ghost text-clay-600', icon: faBan, tone: 'danger' },
    menunggu: { text: 'Menunggu', className: 'btn-ghost', icon: faClock, tone: 'primary' },
};

export default function AdminOrderShow({ order, allowedStatuses }: Props) {
    const { errors } = usePage().props as { errors: Record<string, string> };
    const [target, setTarget] = useState<StatusOption | null>(null);
    const [processing, setProcessing] = useState(false);

    const changeStatus = () => {
        if (!target) return;
        // → PUT /admin/orders/{id}/status  { status }
        router.put(route('admin.orders.status', order.id), { status: target.value }, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setTarget(null);
            },
        });
    };

    const details = [
        { icon: faUser, label: 'Nama pemesan', value: order.contact_name },
        { icon: faPhone, label: 'Nomor kontak', value: order.contact_phone },
        { icon: faCalendarDays, label: 'Tanggal', value: formatDate(order.date) },
        { icon: faClock, label: 'Waktu', value: formatTime(order.time) },
        { icon: faLocationDot, label: 'Lokasi', value: order.location, wide: true },
        { icon: faNoteSticky, label: 'Catatan', value: order.notes || '—', wide: true },
    ];

    return (
        <AuthenticatedLayout live={['order', 'allowedStatuses']}>
            <Head title={`Pesanan #${order.id}`} />

            <Link href={route('admin.orders.index')} className="btn-ghost btn-sm mb-6">
                <FontAwesomeIcon icon={faArrowLeft} /> Semua pesanan
            </Link>

            <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
                <div className="space-y-6">
                    <Reveal className="card p-6 md:p-8">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex items-center gap-4">
                                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-forest-900 text-xl text-leaf-400">
                                    <ServiceIcon name={order.service?.name ?? ''} />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-forest-900/40">Pesanan #{order.id}</p>
                                    <h1 className="display text-3xl">{order.service?.name}</h1>
                                    <p className="text-sm text-forest-900/50">
                                        {orderPrice(order) && formatRupiah(orderPrice(order)!)} · dipesan {formatDate(order.created_at)}
                                    </p>
                                </div>
                            </div>
                            <StatusBadge order={order} className="text-sm" />
                        </div>
                        <div className="mt-8 overflow-x-auto pb-2">
                            <div className="min-w-[20rem] max-w-md px-5">
                                <OrderTimeline order={order} />
                            </div>
                        </div>
                    </Reveal>

                    <Reveal delay={100} className="card p-6 md:p-8">
                        <h2 className="display text-2xl">Detail pemesanan</h2>
                        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                            {details.map((d) => (
                                <div key={d.label} className={`flex gap-3 ${d.wide ? 'sm:col-span-2' : ''}`}>
                                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest-50 text-forest-500">
                                        <FontAwesomeIcon icon={d.icon} />
                                    </span>
                                    <div className="min-w-0">
                                        <dt className="text-xs font-semibold uppercase tracking-wider text-forest-900/40">{d.label}</dt>
                                        <dd className="mt-0.5 whitespace-pre-line break-words">{d.value}</dd>
                                    </div>
                                </div>
                            ))}
                        </dl>
                    </Reveal>
                </div>

                <aside className="space-y-4 lg:sticky lg:top-8">
                    {/* Aksi status */}
                    <Reveal variant="right" className="relative overflow-hidden rounded-4xl bg-forest-900 p-6 text-cream shadow-lift">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-leaf-400">Tindakan</p>
                        {allowedStatuses.length === 0 ? (
                            <div className="mt-4 flex items-start gap-3 text-sm text-cream/70">
                                <FontAwesomeIcon icon={faLock} className="mt-0.5 text-leaf-400" />
                                Pesanan sudah berstatus akhir dan tidak dapat diubah lagi.
                            </div>
                        ) : (
                            <div className="mt-4 grid gap-2">
                                {allowedStatuses.map((s) => {
                                    const a = actions[s.value];
                                    return (
                                        <button
                                            key={s.value}
                                            onClick={() => setTarget(s)}
                                            className={`${a.className} ${a.className.includes('ghost') ? 'border-white/15 bg-white/5 text-cream hover:bg-white/10' : ''} w-full`}
                                        >
                                            <FontAwesomeIcon icon={a.icon} /> {a.text}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        <InputError message={errors.status} className="mt-3 text-clay-100" />
                    </Reveal>

                    {/* Akun pemesan */}
                    <Reveal variant="right" delay={100} className="card p-6">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest-900/40">Akun pemesan</p>
                        <div className="mt-4 flex items-center gap-3">
                            <Avatar name={order.user?.name ?? '?'} src={order.user?.avatar_url} className="h-11 w-11 text-sm" />
                            <div className="min-w-0">
                                <p className="truncate font-bold">{order.user?.name}</p>
                                <p className="truncate text-sm text-forest-900/50">
                                    <FontAwesomeIcon icon={faEnvelope} className="me-1.5" />
                                    {order.user?.email}
                                </p>
                                <p className="text-sm text-forest-900/50">
                                    <FontAwesomeIcon icon={faPhone} className="me-1.5" />
                                    {order.user?.phone ?? '—'}
                                </p>
                            </div>
                        </div>
                    </Reveal>
                </aside>
            </div>

            <ConfirmModal
                show={!!target}
                tone={target ? actions[target.value].tone : 'primary'}
                icon={target ? actions[target.value].icon : undefined}
                title={`Ubah status menjadi "${target?.label}"?`}
                message="Pemesan akan melihat status terbaru di halaman pesanannya."
                confirmText={target ? actions[target.value].text : ''}
                processing={processing}
                onConfirm={changeStatus}
                onClose={() => setTarget(null)}
            />
        </AuthenticatedLayout>
    );
}
