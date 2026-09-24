import { Blob, FloatingLeaves, HeroScene, Leaf, LogoMark, Wave } from '@/Components/eco/Illustrations';
import ServiceIcon from '@/Components/eco/ServiceIcon';
import StatusBadge from '@/Components/StatusBadge';
import { formatRupiah } from '@/lib/format';
import { CountUp, Parallax, Reveal, usePointerTilt, useScrolled } from '@/lib/motion';
import { OrderStatus, Service, User } from '@/types';
import {
    faArrowRight,
    faBars,
    faBolt,
    faCircleCheck,
    faClipboardCheck,
    faEnvelope,
    faHouse,
    faLeaf,
    faRecycle,
    faLocationDot,
    faLock,
    faPhone,
    faSeedling,
    faUsers,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

/*
| Landing page (PRD 6.1) — single-page scrolling.
| Props dari routes/web.php: `services` (data layanan asli dari database).
*/

type Props = { services: Service[] };

// Dipakai jika database belum berisi layanan (mis. sebelum seeder dijalankan)
const fallbackServices: Service[] = [
    { id: 0, name: 'Kebersihan Hunian', description: 'Layanan pembersihan rumah, apartemen, dan properti hunian secara menyeluruh dan profesional.', price: '0' },
    { id: 0, name: 'Perawatan Tanaman', description: 'Perawatan taman, pemangkasan tanaman, dan penghijauan lingkungan sekitar Anda.', price: '0' },
    { id: 0, name: 'Pengelolaan Sampah', description: 'Pengangkutan dan pemilahan sampah secara terjadwal dan bertanggung jawab.', price: '0' },
    { id: 0, name: 'Sanitasi Lingkungan', description: 'Sterilisasi dan desinfeksi area lingkungan untuk kehidupan yang lebih sehat.', price: '0' },
];

const challenges = [
    { title: 'Kesibukan Sehari-hari', description: 'Rutinitas padat membuat masyarakat sulit meluangkan waktu untuk membersihkan dan merawat lingkungan sekitar.' },
    { title: 'Kurang Tenaga Profesional', description: 'Tidak semua orang memiliki akses ke layanan kebersihan yang terpercaya, terlatih, dan mudah dijangkau.' },
    { title: 'Lingkungan Terbengkalai', description: 'Ketidakhadiran perawatan rutin menyebabkan lingkungan kotor, tidak nyaman, dan berpotensi menimbulkan penyakit.' },
    { title: 'Proses Pemesanan Rumit', description: 'Mencari dan menghubungi jasa kebersihan satu per satu membutuhkan waktu dan effort yang tidak sedikit.' },
];

const caraKerja = [
    { title: 'Pilih Layanan', description: 'Pilih jenis layanan kebersihan yang sesuai kebutuhan lingkungan Anda.' },
    { title: 'Isi Formulir', description: 'Lengkapi detail pemesanan: lokasi, tanggal, waktu, dan catatan khusus.' },
    { title: 'Kirim Pesanan', description: 'Pesanan dikirim ke tim kami dan diproses dengan cepat.' },
    { title: 'Layanan Selesai', description: 'Tim profesional kami menyelesaikan pekerjaan dan statusnya dapat dipantau.' },
];

const keunggulan = [
    { icon: faLeaf, title: 'Pemesanan Mudah', description: 'Ajukan layanan kebersihan hanya dalam beberapa langkah tanpa kerumitan.' },
    { icon: faClipboardCheck, title: 'Pantau Status', description: 'Lacak perkembangan pesanan Anda dari pemesanan hingga selesai.' },
    { icon: faUsers, title: 'Tim Profesional', description: 'Ditangani tenaga terlatih yang berpengalaman di bidang kebersihan lingkungan.' },
    { icon: faLock, title: 'Aman & Terpercaya', description: 'Sistem terverifikasi dengan proses pemesanan yang terstandarisasi.' },
    { icon: faBolt, title: 'Respons Cepat', description: 'Admin memproses pesanan dengan cepat sehingga layanan segera dijadwalkan.' },
    { icon: faSeedling, title: 'Ramah Lingkungan', description: 'Pendekatan berkelanjutan dengan metode dan material ramah lingkungan.' },
];

const tentangPoints = [
    'Lingkungan bersih dan nyaman untuk seluruh masyarakat',
    'Waktu Anda lebih efisien tanpa mengorbankan kualitas hidup',
    'Mendorong gaya hidup berkelanjutan dan ramah lingkungan',
    'Membuka peluang kerja bagi tenaga kebersihan profesional',
];

const demoOrders: { id: number; name: string; status: OrderStatus; label: string }[] = [
    { id: 497, name: 'Pembersihan Rumah', status: 'selesai', label: 'Selesai' },
    { id: 498, name: 'Perawatan Tanaman', status: 'diproses', label: 'Diproses' },
    { id: 499, name: 'Pengelolaan Sampah', status: 'menunggu', label: 'Menunggu' },
];

const navLinks = [
    { href: '#beranda', label: 'Beranda' },
    { href: '#layanan', label: 'Layanan' },
    { href: '#tentang', label: 'Tentang Kami' },
    { href: '#kontak', label: 'Kontak' },
];

export default function Welcome({ services }: Props) {
    const user = usePage().props.auth?.user as User | null;
    const scrolled = useScrolled(40);
    const [menuOpen, setMenuOpen] = useState(false);
    const [heroRef, tilt] = usePointerTilt<HTMLDivElement>(14);

    const list = services?.length ? services : fallbackServices;
    const dashboardUrl = user ? route(user.role === 'admin' ? 'admin.dashboard' : 'dashboard') : null;
    const orderUrl = (service?: Service) =>
        !user ? route('register') : user.role === 'admin' ? route('admin.services.index') : service?.id ? route('orders.create', { service: service.id }) : route('services.index');

    const stats = [
        { value: '500+', label: 'Layanan Selesai' },
        { value: '50+', label: 'Area Terlayani' },
        { value: '98%', label: 'Tingkat Kepuasan' },
        { value: String(list.length), label: 'Jenis Layanan' },
    ];

    return (
        <div className="relative overflow-x-clip bg-cream">
            <Head title="Clean Space, Better Living" />

            {/* ================= NAVBAR ================= */}
            <header
                className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
                    scrolled ? 'bg-cream/80 py-3 shadow-soft backdrop-blur-lg' : 'py-5'
                }`}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 lg:px-8">
                    <a href="#beranda" className="group">
                        <LogoMark />
                    </a>

                    <nav className="hidden items-center gap-1 rounded-full bg-white/60 p-1 ring-1 ring-forest-900/5 backdrop-blur md:flex">
                        {navLinks.map((l) => (
                            <a
                                key={l.href}
                                href={l.href}
                                className="rounded-full px-4 py-2 text-sm font-semibold text-forest-900/70 transition hover:bg-forest-900 hover:text-cream"
                            >
                                {l.label}
                            </a>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-2 md:flex">
                        {dashboardUrl ? (
                            <Link href={dashboardUrl} className="btn-primary">
                                Dashboard <FontAwesomeIcon icon={faArrowRight} />
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="btn-ghost">
                                    Masuk
                                </Link>
                                <Link href={route('register')} className="btn-primary">
                                    Daftar
                                </Link>
                            </>
                        )}
                    </div>

                    <button
                        className="grid h-11 w-11 place-items-center rounded-full bg-white/80 shadow-soft ring-1 ring-forest-900/5 md:hidden"
                        onClick={() => setMenuOpen((v) => !v)}
                        aria-label="Menu"
                    >
                        <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} />
                    </button>
                </div>

                {menuOpen && (
                    <div className="mx-4 mt-3 animate-scale-in rounded-3xl bg-white p-3 shadow-lift md:hidden">
                        {navLinks.map((l) => (
                            <a
                                key={l.href}
                                href={l.href}
                                onClick={() => setMenuOpen(false)}
                                className="block rounded-2xl px-4 py-3 font-semibold text-forest-900/80 hover:bg-forest-50"
                            >
                                {l.label}
                            </a>
                        ))}
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            {dashboardUrl ? (
                                <Link href={dashboardUrl} className="btn-primary col-span-2">
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="btn-ghost">
                                        Masuk
                                    </Link>
                                    <Link href={route('register')} className="btn-primary">
                                        Daftar
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* ================= HERO ================= */}
            <section id="beranda" className="relative min-h-[100svh] pt-28 lg:pt-32">
                <Blob className="-left-32 top-20 h-96 w-96 bg-leaf-200/60" />
                <Blob className="right-0 top-1/2 h-72 w-72 bg-forest-100 [animation-delay:-6s]" />

                <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 lg:grid-cols-[1.05fr_1fr] lg:px-8">
                    <div>
                        <p className="inline-flex animate-fade-up items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-forest-600 shadow-soft ring-1 ring-forest-900/5">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-leaf-500" />
                            </span>
                            Awareness Initiative for Sustainable Environment &amp; Living
                        </p>

                        <h1 className="display mt-6 animate-fade-up text-5xl leading-[1.02] text-forest-900 [animation-delay:80ms] sm:text-6xl xl:text-7xl">
                            Clean space.
                            <br />
                            Better <em className="relative whitespace-nowrap text-forest-500">
                                living.
                                <svg viewBox="0 0 200 20" className="absolute -bottom-2 left-0 w-full text-leaf-400" aria-hidden>
                                    <path d="M3 14c50-10 140-12 194-4" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
                                </svg>
                            </em>
                        </h1>

                        <p className="mt-7 max-w-lg animate-fade-up text-lg leading-relaxed text-forest-900/65 [animation-delay:160ms]">
                            AISTEL menghadirkan layanan kebersihan dan perawatan lingkungan yang profesional, mudah
                            dipesan, dan terpercaya, langsung dari genggaman Anda.
                        </p>

                        <div className="mt-9 flex animate-fade-up flex-wrap gap-3 [animation-delay:240ms]">
                            <Link href={orderUrl()} className="btn-primary btn-lg group">
                                Pesan Layanan
                                <FontAwesomeIcon icon={faArrowRight} className="transition-transform group-hover:translate-x-1" />
                            </Link>
                            <a href="#layanan" className="btn-ghost btn-lg">
                                Lihat Layanan
                            </a>
                        </div>

                        <div className="mt-10 flex animate-fade-up items-center gap-4 [animation-delay:320ms]">
                            <div className="flex -space-x-3">
                                {[
                                    { c: 'bg-leaf-300 text-forest-900', icon: faLeaf },
                                    { c: 'bg-forest-500 text-cream', icon: faSeedling },
                                    { c: 'bg-sun-400 text-forest-900', icon: faRecycle },
                                    { c: 'bg-forest-200 text-forest-900', icon: faHouse },
                                ].map(({ c, icon }) => (
                                    <span key={c} className={`grid h-10 w-10 place-items-center rounded-full text-sm ring-4 ring-cream ${c}`}>
                                        <FontAwesomeIcon icon={icon} />
                                    </span>
                                ))}
                            </div>
                            <p className="text-sm text-forest-900/60">
                                <strong className="text-forest-900">500+ keluarga</strong> sudah
                                <br /> hidup lebih bersih bersama AISTEL
                            </p>
                        </div>
                    </div>

                    {/* Ilustrasi parallax */}
                    <div ref={heroRef} className="relative animate-fade-up [animation-delay:200ms]">
                        <div
                            className="transition-transform duration-300 ease-out"
                            style={{ transform: `perspective(1200px) rotateY(${tilt.x * 0.4}deg) rotateX(${-tilt.y * 0.4}deg)` }}
                        >
                            <HeroScene className="aspect-[4/5] rounded-5xl shadow-lift ring-1 ring-forest-900/10 sm:aspect-[5/5] lg:aspect-[4/5]" />
                        </div>

                        <div
                            className="absolute -left-4 top-10 animate-float sm:-left-10"
                            style={{ translate: `${tilt.x * -1.2}px ${tilt.y * -1.2}px` }}
                        >
                            <div className="flex items-center gap-3 rounded-2xl bg-white/95 p-3 pe-5 shadow-lift backdrop-blur">
                                <span className="grid h-10 w-10 place-items-center rounded-xl bg-leaf-100 text-forest-700">
                                    <FontAwesomeIcon icon={faCircleCheck} />
                                </span>
                                <div>
                                    <p className="text-[11px] text-forest-900/50">Pesanan #497</p>
                                    <p className="text-sm font-bold">Rumah bersih ✨</p>
                                </div>
                            </div>
                        </div>

                        <div
                            className="absolute -right-3 bottom-24 animate-float-slow sm:-right-8"
                            style={{ translate: `${tilt.x * 1.5}px ${tilt.y * 1.5}px` }}
                        >
                            <div className="rounded-2xl bg-forest-900 p-4 text-cream shadow-lift">
                                <p className="text-[11px] uppercase tracking-wider text-cream/60">Jadwal hari ini</p>
                                <p className="display mt-1 text-2xl">09:00</p>
                                <p className="text-xs text-leaf-300">Tim menuju lokasi</p>
                            </div>
                        </div>
                    </div>
                </div>

                <a
                    href="#tentang-singkat"
                    className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs font-semibold text-forest-900/40 lg:flex"
                >
                    Gulir
                    <span className="flex h-9 w-5 justify-center rounded-full border-2 border-forest-900/20 pt-1.5">
                        <span className="h-2 w-1 animate-bounce rounded-full bg-forest-900/40" />
                    </span>
                </a>
            </section>

            {/* ================= MARQUEE ================= */}
            <div id="tentang-singkat" className="relative -rotate-1 bg-forest-900 py-4 text-cream shadow-lift">
                <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
                    {Array.from({ length: 2 }).flatMap((_, k) =>
                        ['Bersih', 'Hijau', 'Sehat', 'Berkelanjutan', 'Terpercaya', 'Ramah Lingkungan', 'Profesional'].map((w) => (
                            <span key={`${k}-${w}`} className="display flex items-center gap-10 text-2xl italic">
                                {w} <Leaf className="h-5 w-5 not-italic text-leaf-400" />
                            </span>
                        )),
                    )}
                </div>
            </div>

            {/* ================= STATS ================= */}
            <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
                <div className="grid grid-cols-2 gap-y-10 md:grid-cols-4 md:divide-x md:divide-forest-900/10">
                    {stats.map((s, i) => (
                        <Reveal key={s.label} delay={i * 100} className="text-center">
                            <CountUp value={s.value} className="display text-5xl text-forest-900 md:text-6xl" />
                            <p className="mt-2 text-sm font-medium text-forest-900/55">{s.label}</p>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ================= TANTANGAN ================= */}
            <section className="relative bg-sand-100 py-24">
                <Parallax speed={0.2} className="pointer-events-none absolute -left-10 top-10 text-forest-200">
                    <Leaf className="h-40 w-40 -rotate-12" />
                </Parallax>
                <Parallax speed={-0.15} className="pointer-events-none absolute bottom-0 right-6 text-leaf-300">
                    <Leaf className="h-24 w-24 rotate-45" />
                </Parallax>

                <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
                    <Reveal className="max-w-2xl">
                        <p className="eyebrow">Tantangan Nyata</p>
                        <h2 className="display mt-3 text-4xl leading-tight md:text-5xl">
                            Banyak yang peduli lingkungan, <em className="text-forest-500">tapi kekurangan waktu.</em>
                        </h2>
                    </Reveal>

                    <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {challenges.map((c, i) => (
                            <Reveal key={c.title} delay={i * 120}>
                                <article className="card card-hover group h-full p-7">
                                    <span className="display text-5xl text-forest-900/10 transition-colors duration-500 group-hover:text-leaf-400">
                                        0{i + 1}
                                    </span>
                                    <h3 className="mt-4 text-lg font-bold">{c.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-forest-900/60">{c.description}</p>
                                </article>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= LAYANAN ================= */}
            <section id="layanan" className="relative mx-auto max-w-7xl scroll-mt-20 px-5 py-24 lg:px-8">
                <Reveal className="mx-auto max-w-2xl text-center">
                    <p className="eyebrow justify-center">Layanan Kami</p>
                    <h2 className="display mt-3 text-4xl leading-tight md:text-5xl">Solusi kebersihan untuk setiap kebutuhan</h2>
                    <p className="mt-4 text-forest-900/60">
                        Dari hunian pribadi hingga area publik, AISTEL menyediakan layanan lengkap untuk menjaga lingkungan Anda.
                    </p>
                </Reveal>

                <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((s, i) => (
                        <Reveal key={`${s.id}-${s.name}`} delay={(i % 3) * 120} variant="scale">
                            <Link
                                href={orderUrl(s)}
                                className="group relative flex h-full flex-col overflow-hidden rounded-4xl bg-white p-7 shadow-soft ring-1 ring-forest-900/5 transition duration-500 hover:-translate-y-1.5 hover:bg-forest-900 hover:text-cream hover:shadow-lift"
                            >
                                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-leaf-100 transition-all duration-700 group-hover:scale-[2.2] group-hover:bg-forest-800" />
                                <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-forest-900 text-xl text-leaf-400 transition duration-500 group-hover:rotate-[-10deg] group-hover:bg-leaf-400 group-hover:text-forest-900">
                                    <ServiceIcon name={s.name} />
                                </span>
                                <h3 className="relative mt-6 text-xl font-bold">{s.name}</h3>
                                <p className="relative mt-2 flex-1 text-sm leading-relaxed text-forest-900/60 transition-colors group-hover:text-cream/70">
                                    {s.description}
                                </p>
                                <div className="relative mt-6 flex items-center justify-between">
                                    {Number(s.price) > 0 ? (
                                        <span className="text-sm">
                                            <span className="text-forest-900/50 group-hover:text-cream/50">Mulai </span>
                                            <strong className="text-base">{formatRupiah(s.price)}</strong>
                                        </span>
                                    ) : (
                                        <span />
                                    )}
                                    <span className="grid h-10 w-10 place-items-center rounded-full bg-forest-50 text-forest-900 transition duration-500 group-hover:translate-x-1 group-hover:bg-leaf-400">
                                        <FontAwesomeIcon icon={faArrowRight} />
                                    </span>
                                </div>
                            </Link>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ================= CARA KERJA ================= */}
            <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
                <div className="relative overflow-hidden rounded-5xl bg-white p-8 shadow-soft ring-1 ring-forest-900/5 md:p-14">
                    <div className="dots pointer-events-none absolute inset-0 text-forest-900/[0.04]" />
                    <Reveal className="relative max-w-xl">
                        <p className="eyebrow">Cara Kerja</p>
                        <h2 className="display mt-3 text-4xl leading-tight md:text-5xl">Empat langkah menuju lingkungan bersih</h2>
                    </Reveal>

                    <div className="relative mt-14 grid gap-10 md:grid-cols-4 md:gap-6">
                        <Reveal className="absolute left-0 right-0 top-7 hidden md:block">
                            <div className="mx-[12%] h-0.5 origin-left bg-gradient-to-r from-forest-500 via-leaf-400 to-forest-500 [.is-visible_&]:animate-grow" />
                        </Reveal>
                        {caraKerja.map((step, i) => (
                            <Reveal key={step.title} delay={i * 150} className="relative text-center">
                                <span className="relative mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest-900 font-display text-xl font-bold text-leaf-400 ring-8 ring-white">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                                <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-forest-900/60">{step.description}</p>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= KEUNGGULAN (section gelap) ================= */}
            <section className="relative text-cream">
                <Wave className="text-forest-900" flip />
                <div className="relative overflow-hidden bg-forest-900 py-20">
                    <Parallax speed={0.25} className="pointer-events-none absolute -right-16 top-0 text-forest-800">
                        <Leaf className="h-72 w-72 rotate-12" />
                    </Parallax>
                    <Parallax speed={-0.2} className="pointer-events-none absolute -left-10 bottom-0 text-forest-800">
                        <Leaf className="h-56 w-56 -rotate-45" />
                    </Parallax>
                    <FloatingLeaves count={5} />

                    <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-[.9fr_1.1fr] lg:px-8">
                        {/* Mockup aplikasi */}
                        <Reveal variant="left" className="relative mx-auto w-full max-w-sm">
                            <div className="rounded-5xl bg-cream p-3 shadow-lift ring-1 ring-white/10">
                                <div className="rounded-4xl bg-white p-5 text-forest-900">
                                    <div className="flex items-center justify-between">
                                        <LogoMark className="scale-90" />
                                        <span className="h-8 w-8 rounded-full bg-leaf-300" />
                                    </div>
                                    <p className="display mt-6 text-2xl">Halo, Sari 👋</p>
                                    <p className="text-sm text-forest-900/50">3 pesanan aktif minggu ini</p>
                                    <div className="mt-5 grid grid-cols-2 gap-2">
                                        <div className="rounded-2xl bg-forest-900 p-3 text-cream">
                                            <p className="text-[11px] text-cream/60">Selesai</p>
                                            <p className="display text-2xl">12</p>
                                        </div>
                                        <div className="rounded-2xl bg-leaf-100 p-3">
                                            <p className="text-[11px] text-forest-900/60">Diproses</p>
                                            <p className="display text-2xl">2</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        {demoOrders.map((o) => (
                                            <div key={o.id} className="flex items-center justify-between rounded-2xl bg-cream p-3">
                                                <span className="text-sm font-semibold">{o.name}</span>
                                                <StatusBadge order={{ status: o.status, status_label: o.label }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -right-6 -top-6 animate-sway rounded-2xl bg-leaf-400 p-4 text-forest-900 shadow-lift">
                                <FontAwesomeIcon icon={faSeedling} className="text-2xl" />
                            </div>
                        </Reveal>

                        <div>
                            <Reveal>
                                <p className="eyebrow text-leaf-400">Keunggulan Kami</p>
                                <h2 className="display mt-3 text-4xl leading-tight md:text-5xl">
                                    Semua yang Anda butuhkan, <em className="text-leaf-400">dalam satu platform.</em>
                                </h2>
                            </Reveal>
                            <div className="mt-10 grid gap-4 sm:grid-cols-2">
                                {keunggulan.map((k, i) => (
                                    <Reveal key={k.title} delay={i * 90}>
                                        <div className="group flex h-full gap-4 rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 transition duration-300 hover:bg-white/10">
                                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-leaf-400/15 text-leaf-400 transition group-hover:bg-leaf-400 group-hover:text-forest-900">
                                                <FontAwesomeIcon icon={k.icon} />
                                            </span>
                                            <div>
                                                <h3 className="font-bold">{k.title}</h3>
                                                <p className="mt-1 text-sm leading-relaxed text-cream/60">{k.description}</p>
                                            </div>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <Wave className="text-forest-900" />
            </section>

            {/* ================= TENTANG KAMI ================= */}
            <section id="tentang" className="mx-auto grid max-w-7xl scroll-mt-20 items-center gap-14 px-5 py-24 lg:grid-cols-2 lg:px-8">
                <Reveal variant="left">
                    <p className="eyebrow">Tentang Kami</p>
                    <h2 className="display mt-3 text-4xl leading-tight md:text-5xl">
                        Mendorong gaya hidup <em className="text-forest-500">bersih &amp; berkelanjutan.</em>
                    </h2>
                    <p className="mt-5 leading-relaxed text-forest-900/65">
                        AISTEL hadir karena kami percaya bahwa lingkungan yang bersih adalah hak setiap orang. Kami
                        mempertemukan masyarakat dengan tim kebersihan profesional melalui platform digital yang
                        intuitif dan terpercaya.
                    </p>
                    <ul className="mt-7 space-y-3">
                        {tentangPoints.map((p, i) => (
                            <Reveal as="li" key={p} delay={i * 90} variant="left" className="flex items-start gap-3">
                                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf-100 text-xs text-forest-700">
                                    <FontAwesomeIcon icon={faCircleCheck} />
                                </span>
                                <span className="text-forest-900/80">{p}</span>
                            </Reveal>
                        ))}
                    </ul>
                </Reveal>

                <div className="relative">
                    <Blob className="inset-10 bg-leaf-200/70" />
                    <div className="relative space-y-4">
                        {demoOrders.map((o, i) => (
                            <Parallax key={o.id} speed={0.05 * (i + 1)}>
                                <Reveal variant="right" delay={i * 140}>
                                    <div
                                        className={`card flex items-center gap-4 p-5 ${i === 1 ? 'lg:translate-x-10' : ''}`}
                                    >
                                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-forest-900 text-leaf-400">
                                            <ServiceIcon name={o.name} />
                                        </span>
                                        <div className="flex-1">
                                            <p className="text-xs text-forest-900/50">Pesanan #{o.id}</p>
                                            <p className="font-bold">{o.name}</p>
                                        </div>
                                        <StatusBadge order={{ status: o.status, status_label: o.label }} />
                                    </div>
                                </Reveal>
                            </Parallax>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= CTA ================= */}
            <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
                <Reveal variant="scale">
                    <div className="relative overflow-hidden rounded-5xl bg-leaf-400 px-6 py-16 text-center text-forest-900 md:py-24">
                        <Parallax speed={0.2} className="pointer-events-none absolute -left-10 -top-10 text-leaf-300">
                            <Leaf className="h-48 w-48 rotate-[-20deg]" />
                        </Parallax>
                        <Parallax speed={-0.2} className="pointer-events-none absolute -bottom-16 -right-6 text-leaf-500/60">
                            <Leaf className="h-56 w-56 rotate-[30deg]" />
                        </Parallax>
                        <div className="relative">
                            <h2 className="display mx-auto max-w-2xl text-4xl leading-tight md:text-6xl">
                                Mulai perjalanan <em>hidup lebih bersih.</em>
                            </h2>
                            <p className="mx-auto mt-5 max-w-xl text-forest-900/70">
                                Bergabunglah dengan ratusan keluarga yang sudah merasakan manfaat AISTEL. Pesan layanan pertama Anda hari ini.
                            </p>
                            <div className="mt-9 flex flex-wrap justify-center gap-3">
                                <Link href={dashboardUrl ?? route('register')} className="btn-primary btn-lg">
                                    {user ? 'Buka Dashboard' : 'Daftar Gratis Sekarang'}
                                </Link>
                                <a href="#layanan" className="btn btn-lg bg-white/50 text-forest-900 hover:bg-white">
                                    Lihat Layanan
                                </a>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* ================= FOOTER ================= */}
            <footer id="kontak" className="relative bg-forest-950 text-cream">
                <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
                    <div>
                        <LogoMark light />
                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/60">
                            Awareness Initiative for Sustainable Environment &amp; Living. Platform layanan kebersihan dan
                            perawatan lingkungan untuk masyarakat modern.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-leaf-400">Platform</h3>
                        <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
                            {navLinks.map((l) => (
                                <li key={l.href}>
                                    <a href={l.href} className="transition hover:text-leaf-300">
                                        {l.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-leaf-400">Kontak</h3>
                        <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
                            <li className="flex items-center gap-2.5">
                                <FontAwesomeIcon icon={faEnvelope} className="w-4 text-leaf-400" /> hello@aistel.id
                            </li>
                            <li className="flex items-center gap-2.5">
                                <FontAwesomeIcon icon={faPhone} className="w-4 text-leaf-400" /> +62 812-3456-7890
                            </li>
                            <li className="flex items-center gap-2.5">
                                <FontAwesomeIcon icon={faLocationDot} className="w-4 text-leaf-400" /> Indonesia
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-white/10">
                    <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-5 py-6 text-xs text-cream/40 sm:flex-row lg:px-8">
                        <p>© {new Date().getFullYear()} AISTEL. All rights reserved.</p>
                        <p>Awareness Initiative for Sustainable Environment &amp; Living</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
