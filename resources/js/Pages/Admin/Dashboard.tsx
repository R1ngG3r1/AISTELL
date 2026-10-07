import Avatar from '@/Components/eco/Avatar';
import DashboardHero from '@/Components/eco/dashboard/DashboardHero';
import IconTile from '@/Components/eco/dashboard/IconTile';
import MiniCalendar from '@/Components/eco/dashboard/MiniCalendar';
import Panel from '@/Components/eco/dashboard/Panel';
import ProgressRow from '@/Components/eco/dashboard/ProgressRow';
import EmptyState from '@/Components/eco/EmptyState';
import OrderCardList from '@/Components/eco/OrderCardList';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate, formatTime } from '@/lib/format';
import { Order, OrderStats, OrderStatus, PageProps, ScheduleDay } from '@/types';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
    faBan,
    faChevronRight,
    faCircleCheck,
    faClipboardList,
    faHourglassHalf,
    faLayerGroup,
    faListCheck,
    faPaperPlane,
    faUser,
    faUsers,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link, router } from '@inertiajs/react';

// Props dari DashboardController@admin
type Props = PageProps<{
    stats: OrderStats;
    latestOrders: Order[];
    pendingOrders: Order[]; // pesanan Menunggu, terlama di atas
    schedule: ScheduleDay[]; // data kalender
}>;

// Prop yang diperbarui otomatis setiap beberapa detik (realtime): pesanan baru langsung muncul
const LIVE_PROPS = ['stats', 'latestOrders', 'pendingOrders', 'schedule'];

const statuses: { status: OrderStatus; label: string; icon: IconDefinition; bar: string; tile: string }[] = [
    { status: 'menunggu', label: 'Menunggu', icon: faPaperPlane, bar: 'bg-[#f2c14e]', tile: 'bg-[#fdf3d7] text-[#b7861b]' },
    { status: 'diproses', label: 'Diproses', icon: faHourglassHalf, bar: 'bg-[#287e59]', tile: 'bg-[#eaf2e6] text-[#287e59]' },
    { status: 'selesai', label: 'Selesai', icon: faCircleCheck, bar: 'bg-[#2ea368]', tile: 'bg-[#dcefe2] text-[#1e6244]' },
    { status: 'ditolak', label: 'Ditolak', icon: faXmark, bar: 'bg-[#d9764a]', tile: 'bg-[#fbe9e1] text-[#c05f35]' },
    { status: 'dibatalkan', label: 'Dibatalkan', icon: faBan, bar: 'bg-[#0c2b20]/30', tile: 'bg-[#ece8da] text-[#0c2b20]/55' },
];

export default function AdminDashboard({ auth, stats, latestOrders, pendingOrders, schedule }: Props) {
    const orderUrl = (status?: OrderStatus) => route('admin.orders.index', status ? { status } : {});
    const firstName = auth.user.name.split(' ')[0];
    const completion = stats.total > 0 ? Math.round((stats.selesai / stats.total) * 100) : 0;

    return (
        <AuthenticatedLayout live={LIVE_PROPS}>
            <Head title="Dashboard Admin" />

            <DashboardHero
                eyebrow="Dashboard Admin"
                title={
                    <>
                        Selamat datang, <span className="text-[#2ea368]">{firstName}!</span>
                    </>
                }
                description={
                    stats.menunggu > 0
                        ? `${stats.menunggu} pesanan baru menunggu konfirmasi Anda.`
                        : 'Semua pesanan baru sudah ditangani. Kerja bagus! 🌿'
                }
                userName={auth.user.name}
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

            {/* Ringkasan pesanan */}
            <section className="mt-6">
                <Panel title="Ringkasan Pesanan" action={{ label: 'Semua pesanan', href: orderUrl() }}>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                        <IconTile icon={faClipboardList} label="Total" value={stats.total} href={orderUrl()} highlight />
                        {statuses.map((s) => (
                            <IconTile
                                key={s.status}
                                icon={s.icon}
                                label={s.label}
                                value={stats[s.status]}
                                href={orderUrl(s.status)}
                                iconClass={s.tile}
                            />
                        ))}
                    </div>

                    {/* Target penyelesaian */}
                    <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[#e1e8db] bg-[#f6f8f2] p-4 sm:flex-row sm:items-center">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#07271e] text-[#4de097]">
                            <FontAwesomeIcon icon={faCircleCheck} />
                        </span>
                        <div className="flex-1">
                            <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
                                <span className="font-bold">Tingkat penyelesaian pesanan</span>
                                <span className="font-bold tabular-nums">
                                    {stats.selesai} <span className="font-medium text-[#0c2b20]/40">/ {stats.total}</span>
                                </span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-[#e4ebde]">
                                <div className="h-full origin-left animate-grow rounded-full bg-[#2ea368]" style={{ width: `${completion}%` }} />
                            </div>
                            <p className="mt-1.5 text-xs text-[#0c2b20]/50">{completion}% pesanan telah selesai dikerjakan.</p>
                        </div>
                    </div>
                </Panel>
            </section>

            {/* Distribusi & pesanan terbaru */}
            <section className="mt-5 grid items-start gap-5 xl:grid-cols-3">
                <Panel title="Distribusi Status" delay={60}>
                    <p className="-mt-2 mb-3 text-xs text-[#0c2b20]/50">Dari {stats.total} pesanan</p>
                    <div className="space-y-1.5">
                        {statuses.map((s, i) => (
                            <ProgressRow
                                key={s.status}
                                icon={s.icon}
                                label={s.label}
                                value={stats[s.status]}
                                max={stats.total}
                                barClass={s.bar}
                                iconClass={s.tile}
                                href={orderUrl(s.status)}
                                delay={i * 90}
                            />
                        ))}
                    </div>
                </Panel>

                <Panel
                    title="Pesanan Terbaru"
                    action={{ label: 'Lihat semua', href: orderUrl() }}
                    className="xl:col-span-2"
                    bodyClassName="-mx-5 -mb-5 sm:-mx-6 sm:-mb-6"
                    delay={120}
                >
                    {latestOrders.length === 0 ? (
                        <EmptyState title="Belum ada pesanan masuk" />
                    ) : (
                        <>
                        <OrderCardList orders={latestOrders} className="md:hidden" />
                        <div className="hidden overflow-x-auto md:block">
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
                                                    <Avatar name={o.contact_name} src={o.user?.avatar_url} />
                                                    <span>
                                                        <span className="block font-semibold">{o.contact_name}</span>
                                                        <span className="text-xs text-[#0c2b20]/45">#{o.id}</span>
                                                    </span>
                                                </Link>
                                            </td>
                                            <td className="whitespace-nowrap">{o.service?.name}</td>
                                            <td className="whitespace-nowrap text-[#0c2b20]/60">
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
                        </>
                    )}
                </Panel>
            </section>

            {/* Jadwal, perlu tindakan, akses cepat */}
            <section className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <Panel title="Jadwal Layanan" delay={60}>
                    <MiniCalendar schedule={schedule} />
                    <p className="mt-3 text-xs text-[#0c2b20]/50">
                        Tanggal bertanda = jadwal layanan yang belum dibatalkan/ditolak. Angka = jumlah jadwal di hari itu.
                    </p>
                </Panel>

                <Panel title="Perlu Tindakan" action={{ label: 'Tinjau', href: orderUrl('menunggu') }} delay={120}>
                    {pendingOrders.length === 0 ? (
                        <div className="grid h-full place-items-center rounded-2xl border border-dashed border-[#cfdcc9] p-6 text-center text-sm text-[#0c2b20]/55">
                            Tidak ada pesanan yang menunggu konfirmasi. 🌿
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {pendingOrders.map((o) => (
                                <li key={o.id}>
                                    <Link
                                        href={route('admin.orders.show', o.id)}
                                        className="group flex items-center gap-3 rounded-2xl border border-[#e1e8db] bg-[#f6f8f2] p-3 transition hover:border-[#b8dcc7] hover:bg-white"
                                    >
                                        <Avatar name={o.contact_name} src={o.user?.avatar_url} />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-bold">{o.service?.name}</p>
                                            <p className="truncate text-xs text-[#0c2b20]/55">
                                                {o.contact_name} · {formatDate(o.date)}
                                            </p>
                                        </div>
                                        <FontAwesomeIcon
                                            icon={faChevronRight}
                                            className="text-xs text-[#0c2b20]/30 transition group-hover:translate-x-0.5 group-hover:text-[#287e59]"
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>

                <Panel title="Akses Cepat" delay={180} className="md:col-span-2 xl:col-span-1">
                    <div className="grid grid-cols-2 gap-3">
                        <IconTile icon={faListCheck} label="Kelola Pesanan" href={orderUrl()} />
                        <IconTile icon={faLayerGroup} label="Kelola Layanan" href={route('admin.services.index')} />
                        <IconTile icon={faUsers} label="Pengguna" href={route('users.index')} />
                        <IconTile icon={faUser} label="Profil Saya" href={route('profile.edit')} />
                    </div>
                </Panel>
            </section>
        </AuthenticatedLayout>
    );
}
