import ConfirmModal from '@/Components/eco/ConfirmModal';
import { MethodLogo, PaymentBadge } from '@/Components/eco/Payment';
import { Leaf } from '@/Components/eco/Illustrations';
import OrderTimeline from '@/Components/eco/OrderTimeline';
import ServiceIcon from '@/Components/eco/ServiceIcon';
import StatusBadge from '@/Components/StatusBadge';
import { GoogleMapsLink, MapPreview } from '@/Components/eco/map';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { toLatLng } from '@/lib/geo';
import { formatDate, formatRupiah, formatTime, orderPrice } from '@/lib/format';
import { Reveal } from '@/lib/motion';
import { Order, PageProps } from '@/types';
import {
    faArrowLeft,
    faBan,
    faCalendarDays,
    faClock,
    faCreditCard,
    faLocationDot,
    faNoteSticky,
    faPhone,
    faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const statusMessage: Record<Order['status'], string> = {
    menunggu: 'Pesanan Anda sudah kami terima dan menunggu konfirmasi admin.',
    diproses: 'Pesanan diterima! Tim kami sedang menyiapkan layanan untuk Anda.',
    selesai: 'Layanan selesai. Terima kasih telah menjaga lingkungan bersama AISTEL 🌱',
    ditolak: 'Maaf, pesanan ini tidak dapat kami proses. Silakan buat pesanan baru atau hubungi kami.',
    dibatalkan: 'Pesanan ini telah dibatalkan.',
};

// Props dari OrderController@show
export default function OrderShow({ order }: PageProps<{ order: Order }>) {
    const [confirming, setConfirming] = useState(false);
    const [processing, setProcessing] = useState(false);

    const cancel = () =>
        router.patch(route('orders.cancel', order.id), {}, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setConfirming(false);
            },
        });

    const point = toLatLng(order); // titik peta lokasi (null untuk pesanan tanpa titik)

    const details = [
        { icon: faUser, label: 'Nama pemesan', value: order.contact_name },
        { icon: faPhone, label: 'Nomor kontak', value: order.contact_phone },
        { icon: faCalendarDays, label: 'Tanggal', value: formatDate(order.date) },
        { icon: faClock, label: 'Waktu', value: formatTime(order.time) },
        { icon: faLocationDot, label: 'Lokasi', value: order.location, wide: true },
        { icon: faNoteSticky, label: 'Catatan', value: order.notes || '—', wide: true },
    ];

    return (
        <AuthenticatedLayout live={['order']}>
            <Head title={`Pesanan #${order.id}`} />

            <Link href={route('orders.index')} className="btn-ghost btn-sm mb-6">
                <FontAwesomeIcon icon={faArrowLeft} /> Pesanan saya
            </Link>

            <div className="grid items-start gap-6 lg:grid-cols-[1fr_21rem]">
                <div className="space-y-6">
                    <Reveal className="card p-6 md:p-8">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-forest-900/40">Pesanan #{order.id}</p>
                                <h1 className="display mt-1 text-3xl md:text-4xl">{order.service?.name}</h1>
                                <p className="mt-1 text-sm text-forest-900/50">Dipesan {formatDate(order.created_at)}</p>
                            </div>
                            <StatusBadge order={order} className="text-sm" />
                        </div>

                        <div className="mt-8 overflow-x-auto pb-2">
                            <div className="min-w-[20rem] max-w-md px-5">
                                <OrderTimeline order={order} />
                            </div>
                        </div>
                        <p className="mt-6 rounded-2xl bg-forest-50 p-4 text-sm text-forest-700">{statusMessage[order.status]}</p>
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
                                        <dd className="mt-0.5 whitespace-pre-line break-words text-forest-900">{d.value}</dd>
                                    </div>
                                </div>
                            ))}
                        </dl>
                        {point && (
                            <div className="mt-6">
                                <MapPreview point={point} />
                                <GoogleMapsLink point={point} className="mt-3" />
                            </div>
                        )}
                    </Reveal>
                </div>

                <aside className="space-y-4 lg:sticky lg:top-8">
                    <Reveal variant="right" className="relative overflow-hidden rounded-4xl bg-forest-900 p-6 text-cream shadow-lift">
                        <Leaf className="absolute -bottom-8 -right-8 h-36 w-36 rotate-12 text-forest-800" />
                        <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-leaf-400 text-forest-900">
                            <ServiceIcon name={order.service?.name ?? ''} />
                        </span>
                        <p className="relative mt-4 font-bold">{order.service?.name}</p>
                        {order.service?.description && (
                            <p className="relative mt-1 line-clamp-3 text-sm text-cream/60">{order.service.description}</p>
                        )}
                        <div className="relative mt-5 flex items-baseline justify-between border-t border-white/10 pt-4">
                            <span className="text-sm text-cream/60">Biaya</span>
                            <span className="display text-3xl">{orderPrice(order) ? formatRupiah(orderPrice(order)!) : '—'}</span>
                        </div>
                    </Reveal>

                    {/* Pembayaran (dummy) */}
                    {(order.payment || order.status === 'menunggu' || order.status === 'diproses') && (
                        <Reveal variant="right" delay={60} className="card p-5">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest-900/40">Pembayaran</p>
                                <PaymentBadge payment={order.payment?.status === 'dibatalkan' ? null : order.payment} />
                            </div>
                            {order.payment && order.payment.status !== 'dibatalkan' && (
                                <div className="mt-3 flex items-center gap-3">
                                    <MethodLogo method={order.payment.method} />
                                    <div className="min-w-0 text-sm">
                                        <p className="truncate font-semibold">{order.payment.method_label}</p>
                                        <p className="text-xs text-forest-900/50">{formatRupiah(order.payment.amount)}</p>
                                    </div>
                                </div>
                            )}
                            <Link href={route('orders.payment', order.id)} className={`${order.payment?.status === 'lunas' ? 'btn-ghost' : 'btn-primary'} mt-4 w-full`}>
                                <FontAwesomeIcon icon={faCreditCard} />
                                {order.payment?.status === 'lunas' || order.payment?.status === 'dikembalikan'
                                    ? 'Lihat bukti pembayaran'
                                    : order.payment?.status === 'menunggu'
                                      ? 'Lihat cara bayar'
                                      : 'Bayar sekarang'}
                            </Link>
                        </Reveal>
                    )}

                    {/* Sama dengan aturan OrderPolicy::cancel di backend */}
                    {order.status === 'menunggu' && (
                        <Reveal variant="right" delay={100}>
                            <button onClick={() => setConfirming(true)} className="btn-ghost w-full text-clay-600 hover:border-clay-500/40">
                                <FontAwesomeIcon icon={faBan} /> Batalkan Pesanan
                            </button>
                        </Reveal>
                    )}
                </aside>
            </div>

            <ConfirmModal
                show={confirming}
                tone="danger"
                icon={faBan}
                title="Batalkan pesanan?"
                message={
                    order.payment?.status === 'lunas'
                        ? 'Pesanan ini sudah dibayar. Dana akan dikembalikan ke metode pembayaran asal (simulasi).'
                        : 'Pesanan yang dibatalkan tidak dapat diaktifkan kembali. Anda bisa membuat pesanan baru kapan saja.'
                }
                confirmText="Ya, batalkan"
                processing={processing}
                onConfirm={cancel}
                onClose={() => setConfirming(false)}
            />
        </AuthenticatedLayout>
    );
}
