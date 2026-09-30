import EmptyState from '@/Components/eco/EmptyState';
import { Leaf } from '@/Components/eco/Illustrations';
import ServiceIcon from '@/Components/eco/ServiceIcon';
import StatCard from '@/Components/eco/StatCard';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate, formatTime } from '@/lib/format';
import { Parallax, Reveal } from '@/lib/motion';
import { Order, OrderStats, PageProps } from '@/types';
import {
    faArrowRight,
    faCircleCheck,
    faClipboardList,
    faHourglassHalf,
    faLightbulb,
    faPaperPlane,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link } from '@inertiajs/react';

// Props dari DashboardController@user
type Props = PageProps<{ stats: OrderStats; latestOrders: Order[] }>;

const tips = [
    'Pisahkan sampah organik dan anorganik sejak dari dapur agar mudah didaur ulang.',
    'Bersihkan selokan sebelum musim hujan untuk mencegah genangan dan nyamuk.',
    'Tanaman hias di dalam rumah membantu menyaring udara secara alami.',
    'Gunakan cairan pembersih ramah lingkungan untuk menjaga kualitas air tanah.',
];

function greeting() {
    const h = new Date().getHours();
    return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam';
}

export default function Dashboard({ auth, stats, latestOrders }: Props) {
    const tip = tips[new Date().getDate() % tips.length];
    const firstName = auth.user.name.split(' ')[0];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            {/* Banner sambutan */}
            <section className="relative overflow-hidden rounded-5xl bg-forest-900 p-8 text-cream shadow-lift md:p-12">
                <Parallax speed={0.15} className="pointer-events-none absolute -right-10 -top-16 text-forest-800">
                    <Leaf className="h-72 w-72 rotate-12" />
                </Parallax>
                <Parallax speed={-0.1} className="pointer-events-none absolute bottom-0 right-40 hidden text-leaf-400/20 md:block">
                    <Leaf className="h-24 w-24 -rotate-45" />
                </Parallax>
                <div className="relative max-w-xl animate-fade-up">
                    <p className="eyebrow text-leaf-400">
                        <Leaf className="h-3.5 w-3.5" /> {greeting()}
                    </p>
                    <h1 className="display mt-3 text-4xl md:text-5xl">
                        Halo, <em className="text-leaf-400">{firstName}</em>
                    </h1>
                    <p className="mt-3 text-cream/70">
                        {stats.menunggu + stats.diproses > 0
                            ? `Ada ${stats.menunggu + stats.diproses} pesanan aktif. Kami akan terus memperbarui statusnya untuk Anda.`
                            : 'Lingkungan bersih dimulai dari satu langkah kecil. Yuk pesan layanan pertama Anda.'}
                    </p>
                    <div className="mt-7 flex flex-wrap gap-3">
                        <Link href={route('services.index')} className="btn-leaf btn-lg group">
                            Pesan Layanan
                            <FontAwesomeIcon icon={faArrowRight} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link href={route('orders.index')} className="btn btn-lg bg-white/10 text-cream ring-1 ring-white/15 hover:bg-white/20">
                            Pesanan Saya
                        </Link>
                    </div>
                </div>
            </section>

            {/* Statistik */}
            <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Total Pesanan" value={stats.total} icon={faClipboardList} highlight />
                <StatCard label="Menunggu" value={stats.menunggu} icon={faPaperPlane} tone="sun" delay={80} />
                <StatCard label="Diproses" value={stats.diproses} icon={faHourglassHalf} tone="mint" delay={160} />
                <StatCard label="Selesai" value={stats.selesai} icon={faCircleCheck} tone="leaf" delay={240} />
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
                {/* Pesanan terbaru */}
                <Reveal className="card p-6 md:p-7">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="display text-2xl">Pesanan Terbaru</h2>
                        <Link href={route('orders.index')} className="text-sm font-semibold text-forest-500 hover:text-forest-700">
                            Lihat semua →
                        </Link>
                    </div>

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
                        <ul className="-mx-2 space-y-1">
                            {latestOrders.map((order, i) => (
                                <Reveal as="li" key={order.id} delay={i * 60} variant="left">
                                    <Link
                                        href={route('orders.show', order.id)}
                                        className="group flex items-center gap-4 rounded-2xl p-3 transition hover:bg-forest-50"
                                    >
                                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-forest-900 text-leaf-400 transition group-hover:rotate-[-8deg]">
                                            <ServiceIcon name={order.service?.name ?? ''} />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-semibold">{order.service?.name}</p>
                                            <p className="text-sm text-forest-900/50">
                                                {formatDate(order.date)} · {formatTime(order.time)}
                                            </p>
                                        </div>
                                        <StatusBadge order={order} />
                                    </Link>
                                </Reveal>
                            ))}
                        </ul>
                    )}
                </Reveal>

                {/* Tips hijau */}
                <Reveal variant="right" delay={120}>
                    <div className="relative h-full overflow-hidden rounded-4xl bg-leaf-400 p-7 text-forest-900">
                        <Leaf className="absolute -bottom-8 -right-8 h-40 w-40 rotate-12 text-leaf-500/50" />
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-forest-900 text-leaf-400">
                            <FontAwesomeIcon icon={faLightbulb} />
                        </span>
                        <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-forest-900/60">Tips hijau hari ini</p>
                        <p className="display relative mt-2 text-xl leading-snug">{tip}</p>
                    </div>
                </Reveal>
            </section>
        </AuthenticatedLayout>
    );
}
