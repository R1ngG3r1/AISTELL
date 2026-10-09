import DashboardHero from '@/Components/eco/dashboard/DashboardHero';
import IconTile from '@/Components/eco/dashboard/IconTile';
import MiniCalendar from '@/Components/eco/dashboard/MiniCalendar';
import Panel from '@/Components/eco/dashboard/Panel';
import ProgressRow from '@/Components/eco/dashboard/ProgressRow';
import TipsCarousel from '@/Components/eco/dashboard/TipsCarousel';
import EmptyState from '@/Components/eco/EmptyState';
import ServiceIcon from '@/Components/eco/ServiceIcon';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate, formatTime } from '@/lib/format';
import { Reveal } from '@/lib/motion';
import { Order, OrderStats, PageProps, ScheduleDay } from '@/types';
import {
    faArrowRight,
    faBan,
    faCircleCheck,
    faClipboardList,
    faHourglassHalf,
    faPaperPlane,
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

            {/*
              Dua kolom (kiri lebar, kanan sempit). Kartu ditumpuk per kolom, bukan per baris,
              sehingga tinggi kartu yang berbeda tidak meninggalkan ruang kosong. Kartu terakhir
              di setiap kolom mengisi sisa tinggi agar kedua kolom berakhir sejajar.
            */}
            <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
                {/* Kolom kiri */}
                <div className="flex min-w-0 flex-col gap-5 xl:col-span-2">
                    <Panel title="Ringkasan Pesanan" action={{ label: 'Lihat semua', href: route('orders.index') }}>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-[15rem_minmax(0,1fr)]">
                            {/* HP: Total selebar kartu + 2 petak; tablet kecil: 3 sejajar; md+: bertumpuk di kolom kiri */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-1">
                                <IconTile icon={faClipboardList} label="Total Pesanan" value={stats.total} highlight horizontal className="col-span-2 sm:col-span-1" />
                                <IconTile icon={faHourglassHalf} label="Pesanan Aktif" value={active} iconClass="bg-[#fdf3d7] text-[#b7861b]" horizontal />
                                <IconTile icon={faCircleCheck} label="Selesai" value={stats.selesai} horizontal />
                            </div>
                            <div className="flex flex-col justify-between gap-2">
                                <ProgressRow icon={faPaperPlane} label="Menunggu konfirmasi" value={stats.menunggu} max={stats.total} barClass="bg-[#f2c14e]" iconClass="bg-[#fdf3d7] text-[#b7861b]" />
                                <ProgressRow icon={faHourglassHalf} label="Sedang diproses" value={stats.diproses} max={stats.total} delay={90} />
                                <ProgressRow icon={faCircleCheck} label="Selesai" value={stats.selesai} max={stats.total} barClass="bg-[#2ea368]" delay={180} />
                                <ProgressRow icon={faXmark} label="Ditolak" value={stats.ditolak} max={stats.total} barClass="bg-[#d9764a]" iconClass="bg-[#fbe9e1] text-[#c05f35]" delay={270} />
                                <ProgressRow icon={faBan} label="Dibatalkan" value={stats.dibatalkan} max={stats.total} barClass="bg-[#0c2b20]/30" iconClass="bg-[#ece8da] text-[#0c2b20]/55" delay={360} />
                            </div>
                        </div>
                    </Panel>

                    <Panel title="Pesanan Terbaru" action={{ label: 'Lihat semua', href: route('orders.index') }} className="flex-1" delay={80}>
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
                </div>

                {/* Kolom kanan (di tablet: dua kartu berdampingan) */}
                <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-1 xl:grid-rows-[auto_1fr]">
                    <Panel title="Jadwal Layanan" delay={120}>
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

                    {/* Carousel tips: foto ikut membesar mengisi sisa tinggi kolom */}
                    <Panel title="Tips Hijau" delay={200} bodyClassName="flex flex-col">
                        <TipsCarousel />
                    </Panel>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
