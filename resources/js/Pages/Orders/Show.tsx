import DangerButton from '@/Components/DangerButton';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate, formatRupiah, formatTime } from '@/lib/format';
import { Order, PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

// Props dari OrderController@show
export default function OrderShow({ order }: PageProps<{ order: Order }>) {
    const cancel = () => {
        if (confirm('Batalkan pesanan ini?')) {
            router.patch(route('orders.cancel', order.id)); // → PATCH /orders/{id}/cancel
        }
    };

    const rows: [string, string][] = [
        ['Layanan', order.service?.name ?? '-'],
        ['Harga', order.service ? formatRupiah(order.service.price) : '-'],
        ['Nama Pemesan', order.contact_name],
        ['Nomor Kontak', order.contact_phone],
        ['Lokasi', order.location],
        ['Jadwal', `${formatDate(order.date)}, ${formatTime(order.time)}`],
        ['Catatan', order.notes || '-'],
        ['Dipesan pada', formatDate(order.created_at)],
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Pesanan #{order.id}</h2>
                    <StatusBadge order={order} />
                </div>
            }
        >
            <Head title={`Pesanan #${order.id}`} />

            <div className="py-6">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <dl className="divide-y">
                            {rows.map(([label, value]) => (
                                <div key={label} className="grid grid-cols-3 gap-4 py-3 text-sm">
                                    <dt className="text-gray-500">{label}</dt>
                                    <dd className="col-span-2 whitespace-pre-line text-gray-900">{value}</dd>
                                </div>
                            ))}
                        </dl>

                        <div className="mt-6 flex gap-2">
                            <Link href={route('orders.index')} className="rounded-md border px-4 py-2 text-sm text-gray-700">
                                Kembali
                            </Link>
                            {/* Sama dengan aturan OrderPolicy::cancel di backend */}
                            {order.status === 'menunggu' && <DangerButton onClick={cancel}>Batalkan Pesanan</DangerButton>}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
