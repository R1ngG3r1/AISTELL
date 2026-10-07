import DashboardHero from '@/Components/eco/dashboard/DashboardHero';
import IconTile from '@/Components/eco/dashboard/IconTile';
import MiniCalendar from '@/Components/eco/dashboard/MiniCalendar';
import Panel from '@/Components/eco/dashboard/Panel';
import ProgressRow from '@/Components/eco/dashboard/ProgressRow';
import EmptyState from '@/Components/eco/EmptyState';
import ServiceIcon from '@/Components/eco/ServiceIcon';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate, formatTime } from '@/lib/format';
import { Reveal } from '@/lib/motion';
import { tipOfTheDay } from '@/lib/tips';
import { Order, OrderStats, PageProps, ScheduleDay } from '@/types';
import {
    faArrowRight,
    faBan,
    faBroom,
    faCircleCheck,
    faClipboardList,
    faHourglassHalf,
    faPaperPlane,
    faSeedling,
    faUser,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link } from '@inertiajs/react';

// Props dari DashboardController@user
type Props = PageProps<{
    stats: OrderStats;
    latestOrders: Order[];
    upcomingOrders: Order[]; // pesanan aktif dengan jadwal terdekat
    schedule: ScheduleDay[]; // data kalender
}>;

// Prop yang diperbarui otomatis setiap beberapa detik (realtime)
const LIVE_PROPS = ['stats', 'latestOrders', 'upcomingOrders', 'schedule'];

function greeting() {
    const h = new Date().getHours();
    return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam';
}

export default function Dashboard({ auth, stats, latestOrders, upcomingOrders, schedule }: Props) {
    const firstName = auth.user.name.split(' ')[0];
    const active = stats.menunggu + stats.diproses;
    const completion = stats.total > 0 ? Math.round((stats.selesai / stats.total) * 100) : 0;

    return (
        <AuthenticatedLayout live={LIVE_PROPS}>
            <Head title="Dashboard" />

            <DashboardHero
                eyebrow={greeting()}
                title={
                    <>
                        Halo, <span className="text-[#2ea368]">{firstName}!</span>
                    </>
                }
                description={
                    active > 0
                        ? `Ada ${active} pesanan aktif. Kami akan terus memperbarui statusnya untuk Anda.`
                        : 'Lingkungan bersih dimulai dari satu langkah kecil. Yuk pesan layanan untuk hunian Anda.'
                }
                userName={auth.user.name}
                actions={
                    <>
                        <Link href={route('services.index')} className="btn-primary group">
                            Pesan Layanan
                            <FontAwesomeIcon icon={faArrowRight} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link href={route('orders.index')} className="btn-ghost">
                            Pesanan Saya
                        </Link>
                    </>
                }
            />

            {/* Baris 1: ringkasan, progres, jadwal */}
            <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <Panel title="Ringkasan">
                    <div className="grid grid-cols-2 gap-3">
                        <IconTile icon={faClipboardList} label="Total Pesanan" value={stats.total} highlight />
                        <IconTile icon={faHourglassHalf} label="Pesanan Aktif" value={active} iconClass="bg-[#fdf3d7] text-[#b7861b]" />
                        <IconTile icon={faCircleCheck} label="Selesai" value={stats.selesai} />
                        <IconTile icon={faSeedling} label="Tingkat Selesai" value={`${completion}%`} />
                    </div>
                </Panel>

                <Panel title="Progres Pesanan" action={{ label: 'Lihat semua', href: route('orders.index') }} delay={80}>
                    <div className="space-y-2.5">
                        <ProgressRow icon={faPaperPlane} label="Menunggu konfirmasi" value={stats.menunggu} max={stats.total} barClass="bg-[#f2c14e]" iconClass="bg-[#fdf3d7] text-[#b7861b]" />
                        <ProgressRow icon={faHourglassHalf} label="Sedang diproses" value={stats.diproses} max={stats.total} delay={90} />
                        <ProgressRow icon={faCircleCheck} label="Selesai" value={stats.selesai} max={stats.total} barClass="bg-[#2ea368]" delay={180} />
                        <ProgressRow icon={faXmark} label="Ditolak" value={stats.ditolak} max={stats.total} barClass="bg-[#d9764a]" iconClass="bg-[#fbe9e1] text-[#c05f35]" delay={270} />
                        <ProgressRow icon={faBan} label="Dibatalkan" value={stats.dibatalkan} max={stats.total} barClass="bg-[#0c2b20]/30" iconClass="bg-[#ece8da] text-[#0c2b20]/55" delay={360} />
                    </div>
                </Panel>

                <Panel title="Jadwal Layanan" delay={160} className="md:col-span-2 xl:col-span-1">
                    <MiniCalendar schedule={schedule} />
                    <div className="mt-4 space-y-2">
                        {upcomingOrders.length === 0 ? (
                            <p className="rounded-2xl border border-[#e1e8db] bg-[#f6f8f2] px-4 py-3 text-xs text-[#4c6156]">
                                Belum ada jadwal mendatang. Tanggal bertanda menunjukkan jadwal pesanan Anda.
                            </p>
                        ) : (
                            upcomingOrders.map((o) => (
                                <Link
                                    key={o.id}
                                    href={route('orders.show', o.id)}
                                    className="flex items-center gap-3 rounded-2xl border border-[#e1e8db] bg-[#f6f8f2] px-3 py-2 text-xs transition hover:border-[#b8dcc7] hover:bg-white"
                                >
                                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#07271e] text-[#4de097]">
                                        <ServiceIcon name={o.service?.name ?? ''} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate font-bold text-[#0c2b20]">{o.service?.name}</span>
                                        <span className="text-[#4c6156]">
                                            {formatDate(o.date)}, {formatTime(o.time)}
                                        </span>
                                    </span>
                                    <StatusBadge order={o} />
                                </Link>
                            ))
                        )}
                    </div>
                </Panel>
            </section>

            {/* Baris 2: pesanan terbaru & tips */}
            <section className="mt-5 grid gap-5 xl:grid-cols-3">
                <Panel title="Pesanan Terbaru" action={{ label: 'Lihat semua', href: route('orders.index') }} className="xl:col-span-2">
                    {latestOrders.length === 0 ? (
                        <EmptyState
                            title="Belum ada pesanan"
                            description="Pesanan yang Anda buat akan muncul di sini beserta statusnya."
                            action={
                                <Link href={route('services.index')} className="btn-primary">
                                    Pesan layanan pertama
                                </Link>
                            }
                        />
                    ) : (
                        <ul className="space-y-2">
                            {latestOrders.map((order, i) => (
                                <Reveal as="li" key={order.id} delay={i * 60} variant="left">
                                    <Link
                                        href={route('orders.show', order.id)}
                                        className="group flex items-center gap-4 rounded-2xl border border-[#e1e8db] bg-[#f6f8f2] p-3 transition hover:border-[#b8dcc7] hover:bg-white"
                                    >
                                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#07271e] text-[#4de097] transition group-hover:-rotate-6">
                                            <ServiceIcon name={order.service?.name ?? ''} />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11px] font-semibold text-[#0c2b20]/45">Pesanan #{order.id}</p>
                                            <p className="truncate text-sm font-bold">{order.service?.name}</p>
                                            <p className="text-xs text-[#0c2b20]/55">
                                                {formatDate(order.date)} · {formatTime(order.time)}
                                            </p>
                                        </div>
                                        <StatusBadge order={order} />
                                    </Link>
                                </Reveal>
                            ))}
                        </ul>
                    )}
                </Panel>

                <Panel title="Tips Hijau" delay={100}>
                    <div className="overflow-hidden rounded-2xl">
                        <img
                            src="/landingpage/gambar2.png"
                            alt="Daun semanggi di bawah langit cerah"
                            className="h-44 w-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                    </div>
                    <p className="mt-4 text-sm font-semibold leading-relaxed text-[#0c2b20]">{tipOfTheDay()}</p>
                    <p className="mt-1 text-xs text-[#0c2b20]/45">Tips berganti setiap hari 🌿</p>
                </Panel>
            </section>

            {/* Baris 3: akses cepat */}
            <section className="mt-5">
                <Panel title="Akses Cepat">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <IconTile icon={faBroom} label="Pesan Layanan" href={route('services.index')} />
                        <IconTile icon={faClipboardList} label="Pesanan Saya" href={route('orders.index')} />
                        <IconTile icon={faHourglassHalf} label={`${active} Pesanan Aktif`} href={route('orders.index')} iconClass="bg-[#fdf3d7] text-[#b7861b]" />
                        <IconTile icon={faUser} label="Profil Saya" href={route('profile.edit')} />
                    </div>
                </Panel>
            </section>
        </AuthenticatedLayout>
    );
}
