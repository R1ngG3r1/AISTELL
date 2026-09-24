import Avatar from '@/Components/eco/Avatar';
import EmptyState from '@/Components/eco/EmptyState';
import PageHeader from '@/Components/eco/PageHeader';
import StatCard from '@/Components/eco/StatCard';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate, formatTime } from '@/lib/format';
import { Reveal, useInView } from '@/lib/motion';
import { Order, OrderStats, OrderStatus, PageProps } from '@/types';
import {
    faBan,
    faCircleCheck,
    faClipboardList,
    faHourglassHalf,
    faLayerGroup,
    faPaperPlane,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link, router } from '@inertiajs/react';

// Props dari DashboardController@admin
type Props = PageProps<{ stats: OrderStats; latestOrders: Order[] }>;

const bars: { status: OrderStatus; label: string; color: string }[] = [
    { status: 'menunggu', label: 'Menunggu', color: 'bg-sun-400' },
    { status: 'diproses', label: 'Diproses', color: 'bg-forest-500' },
    { status: 'selesai', label: 'Selesai', color: 'bg-leaf-400' },
    { status: 'ditolak', label: 'Ditolak', color: 'bg-clay-500' },
    { status: 'dibatalkan', label: 'Dibatalkan', color: 'bg-forest-900/25' },
];

export default function AdminDashboard({ stats, latestOrders }: Props) {
    const [chartRef, chartVisible] = useInView<HTMLDivElement>();
    const max = Math.max(1, ...bars.map((b) => stats[b.status]));
    const orderUrl = (status?: OrderStatus) => route('admin.orders.index', status ? { status } : {});

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    eyebrow="Dashboard Admin"
                    title="Ringkasan pesanan"
                    description={
                        stats.menunggu > 0
                            ? `${stats.menunggu} pesanan baru menunggu konfirmasi Anda.`
                            : 'Semua pesanan baru sudah ditangani. Kerja bagus! 🌿'
                    }
                    actions={
                        <>
                            <Link href={orderUrl('menunggu')} className="btn-primary">
                                <FontAwesomeIcon icon={faPaperPlane} /> Tinjau pesanan baru
                            </Link>
                            <Link href={route('admin.services.index')} className="btn-ghost">
                                <FontAwesomeIcon icon={faLayerGroup} /> Kelola layanan
                            </Link>
                        </>
                    }
                />
            }
        >
            <Head title="Dashboard Admin" />

            <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                <StatCard label="Total" value={stats.total} icon={faClipboardList} highlight href={orderUrl()} />
                <StatCard label="Menunggu" value={stats.menunggu} icon={faPaperPlane} tone="sun" href={orderUrl('menunggu')} delay={60} />
                <StatCard label="Diproses" value={stats.diproses} icon={faHourglassHalf} tone="mint" href={orderUrl('diproses')} delay={120} />
                <StatCard label="Selesai" value={stats.selesai} icon={faCircleCheck} tone="leaf" href={orderUrl('selesai')} delay={180} />
                <StatCard label="Ditolak" value={stats.ditolak} icon={faXmark} tone="clay" href={orderUrl('ditolak')} delay={240} />
                <StatCard label="Dibatalkan" value={stats.dibatalkan} icon={faBan} tone="sand" href={orderUrl('dibatalkan')} delay={300} />
            </section>

            <section className="mt-8 grid items-start gap-6 lg:grid-cols-[20rem_1fr]">
                {/* Distribusi status */}
                <Reveal className="card p-6">
                    <h2 className="display text-2xl">Distribusi status</h2>
                    <p className="text-sm text-forest-900/50">Dari {stats.total} pesanan</p>
                    <div ref={chartRef} className="mt-6 space-y-4">
                        {bars.map((b, i) => (
                            <Link key={b.status} href={orderUrl(b.status)} className="group block">
                                <div className="mb-1.5 flex justify-between text-sm">
                                    <span className="font-medium text-forest-900/70 group-hover:text-forest-900">{b.label}</span>
                                    <span className="font-bold tabular-nums">{stats[b.status]}</span>
                                </div>
                                <div className="h-2.5 overflow-hidden rounded-full bg-sand-200">
                                    <div
                                        className={`h-full origin-left rounded-full ${b.color} ${chartVisible ? 'animate-grow' : 'scale-x-0'}`}
                                        style={{ width: `${(stats[b.status] / max) * 100}%`, animationDelay: `${i * 90}ms` }}
                                    />
                                </div>
                            </Link>
                        ))}
                    </div>
                </Reveal>

                {/* Pesanan terbaru */}
                <Reveal delay={100} className="card overflow-hidden">
                    <div className="flex items-center justify-between p-6 pb-2">
                        <h2 className="display text-2xl">Pesanan terbaru</h2>
                        <Link href={orderUrl()} className="text-sm font-semibold text-forest-500 hover:text-forest-700">
                            Semua pesanan →
                        </Link>
                    </div>
                    {latestOrders.length === 0 ? (
                        <EmptyState title="Belum ada pesanan masuk" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table-eco">
                                <thead>
                                    <tr>
                                        <th>Pemesan</th>
                                        <th>Layanan</th>
                                        <th>Jadwal</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {latestOrders.map((o) => (
                                        <tr key={o.id} className="cursor-pointer" onClick={() => router.visit(route('admin.orders.show', o.id))}>
                                            <td>
                                                <Link href={route('admin.orders.show', o.id)} className="flex items-center gap-3">
                                                    <Avatar name={o.contact_name} />
                                                    <span>
                                                        <span className="block font-semibold">{o.contact_name}</span>
                                                        <span className="text-xs text-forest-900/45">#{o.id}</span>
                                                    </span>
                                                </Link>
                                            </td>
                                            <td className="whitespace-nowrap">{o.service?.name}</td>
                                            <td className="whitespace-nowrap text-forest-900/60">
                                                {formatDate(o.date)}, {formatTime(o.time)}
                                            </td>
                                            <td>
                                                <StatusBadge order={o} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Reveal>
            </section>
        </AuthenticatedLayout>
    );
}
