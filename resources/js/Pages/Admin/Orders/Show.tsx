import InputError from '@/Components/InputError';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate, formatRupiah, formatTime } from '@/lib/format';
import { Order, OrderStatus, PageProps, StatusOption } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

// Props dari AdminOrderController@show
type Props = PageProps<{ order: Order; allowedStatuses: StatusOption[] }>;

// Warna & teks tombol untuk setiap status tujuan.
const actionStyle: Record<OrderStatus, { text: string; className: string }> = {
    diproses: { text: 'Terima (Diproses)', className: 'bg-blue-600 hover:bg-blue-700' },
    selesai: { text: 'Tandai Selesai', className: 'bg-green-600 hover:bg-green-700' },
    ditolak: { text: 'Tolak', className: 'bg-red-600 hover:bg-red-700' },
    dibatalkan: { text: 'Batalkan', className: 'bg-gray-600 hover:bg-gray-700' },
    menunggu: { text: 'Menunggu', className: 'bg-yellow-600 hover:bg-yellow-700' },
};

export default function AdminOrderShow({ order, allowedStatuses }: Props) {
    const { errors } = usePage().props as { errors: Record<string, string> };

    const changeStatus = (status: OrderStatus, label: string) => {
        if (confirm(`Ubah status pesanan menjadi "${label}"?`)) {
            // → PUT /admin/orders/{id}/status  { status }
            router.put(route('admin.orders.status', order.id), { status }, { preserveScroll: true });
        }
    };

    const rows: [string, string][] = [
        ['Layanan', `${order.service?.name} (${order.service ? formatRupiah(order.service.price) : '-'})`],
        ['Nama Pemesan', order.contact_name],
        ['Nomor Kontak', order.contact_phone],
        ['Akun', `${order.user?.name} · ${order.user?.email} · ${order.user?.phone ?? '-'}`],
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

                        <div className="mt-6 border-t pt-4">
                            <p className="mb-3 text-sm font-medium text-gray-700">Ubah status</p>
                            {allowedStatuses.length === 0 ? (
                                <p className="text-sm text-gray-500">Pesanan sudah berstatus akhir dan tidak dapat diubah.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {allowedStatuses.map((s) => (
                                        <button
                                            key={s.value}
                                            onClick={() => changeStatus(s.value, s.label)}
                                            className={`rounded-md px-4 py-2 text-sm font-medium text-white ${actionStyle[s.value].className}`}
                                        >
                                            {actionStyle[s.value].text}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <InputError message={errors.status} className="mt-2" />
                        </div>

                        <Link
                            href={route('admin.orders.index')}
                            className="mt-6 inline-block rounded-md border px-4 py-2 text-sm text-gray-700"
                        >
                            Kembali
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
