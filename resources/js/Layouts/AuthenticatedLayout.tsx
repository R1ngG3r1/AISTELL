import Avatar from '@/Components/eco/Avatar';
import Footer from '@/Components/eco/Footer';
import FlashMessage from '@/Components/FlashMessage';
import { LIVE_INTERVAL, useLivePoll } from '@/lib/live';
import { tipOfTheDay } from '@/lib/tips';
import { Counters, PageProps } from '@/types';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
    faBars,
    faBroom,
    faClipboardList,
    faHouse,
    faLayerGroup,
    faLightbulb,
    faListCheck,
    faRightFromBracket,
    faUser,
    faUsers,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';

type MenuItem = { label: string; route: string; icon: IconDefinition; active: string[]; badge?: keyof Counters };

// Menu navigasi per role (PRD 6.2 User Area & 6.3 Admin Area).
// `active` = daftar pola nama route; menu menyala jika salah satunya cocok.
const userMenu: MenuItem[] = [
    { label: 'Dashboard', route: 'dashboard', icon: faHouse, active: ['dashboard'] },
    { label: 'Pesan Layanan', route: 'services.index', icon: faBroom, active: ['services.*', 'orders.create'] },
    { label: 'Pesanan Saya', route: 'orders.index', icon: faClipboardList, active: ['orders.index', 'orders.show'], badge: 'activeOrders' },
];

const adminMenu: MenuItem[] = [
    { label: 'Dashboard', route: 'admin.dashboard', icon: faHouse, active: ['admin.dashboard'] },
    { label: 'Kelola Pesanan', route: 'admin.orders.index', icon: faListCheck, active: ['admin.orders.*'], badge: 'pendingOrders' },
    { label: 'Kelola Layanan', route: 'admin.services.index', icon: faLayerGroup, active: ['admin.services.*'] },
    { label: 'Pengguna', route: 'users.index', icon: faUsers, active: ['users.*'] },
];

const accountMenu: MenuItem[] = [{ label: 'Profil Saya', route: 'profile.edit', icon: faUser, active: ['profile.*'] }];

const isActive = (patterns: string[]) => patterns.some((p) => route().current(p));

function SidebarLink({ item }: { item: MenuItem }) {
    const { counters } = usePage<PageProps>().props;
    const active = isActive(item.active);
    const count = item.badge ? (counters?.[item.badge] ?? 0) : 0;
    return (
        <Link
            href={route(item.route)}
            className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                active
                    ? 'bg-[#f5f7f2] text-[#07271e] shadow-[0_6px_18px_-6px_rgba(0,0,0,0.45)]'
                    : 'text-[#d8eadf] hover:bg-white/10 hover:text-white'
            }`}
        >
            <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-[13px] transition ${
                    active ? 'bg-[#287e59] text-white' : 'bg-white/5 text-[#9fe0bf] group-hover:bg-white/10'
                }`}
            >
                <FontAwesomeIcon icon={item.icon} />
            </span>
            <span className="flex-1">{item.label}</span>
            {count > 0 && (
                <span
                    className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold tabular-nums ${
                        active ? 'bg-[#287e59] text-white' : 'bg-[#4de097] text-[#07271e]'
                    }`}
                    title={item.badge === 'pendingOrders' ? `${count} pesanan menunggu konfirmasi` : `${count} pesanan aktif`}
                >
                    {count}
                </span>
            )}
        </Link>
    );
}

function Sidebar() {
    const user = usePage<PageProps>().props.auth.user;
    const isAdmin = user.role === 'admin';
    const menu = isAdmin ? adminMenu : userMenu;

    return (
        <div className="relative isolate flex h-full flex-col overflow-hidden bg-[#07271e] text-white">
            {/* Pola daun seperti landing page, digelapkan */}
            <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-[url('/landingpage/latardaun.jpeg')] bg-[length:420px_auto] bg-repeat opacity-60"
            />
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-[#07271e]/80 via-[#07271e]/90 to-[#051d16]/95" />

            <div className="flex-1 overflow-y-auto px-4 pb-4 pt-6">
                {/* Papan nama brand */}
                <Link
                    href={route(isAdmin ? 'admin.dashboard' : 'dashboard')}
                    className="group relative mx-1 block rounded-2xl border-2 border-[#c5ddd1] bg-[#f5f7f2] px-4 py-4 text-center shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6)] transition hover:-translate-y-0.5"
                >
                    <span className="block text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#4c6156]">
                        {isAdmin ? 'Panel Admin' : 'Selamat datang di'}
                    </span>
                    <span className="mt-1 flex items-center justify-center gap-2">
                        <img
                            src="/landingpage/LOGO.png"
                            alt=""
                            aria-hidden="true"
                            className="h-7 w-7 object-contain transition-transform group-hover:rotate-6"
                        />
                        <span className="text-2xl font-extrabold tracking-tight text-[#07271e]">AISTEL</span>
                    </span>
                    <span className="mt-0.5 block text-[11px] font-medium text-[#287e59]">Clean Space · Better Living</span>
                </Link>

                <p className="mb-2 ml-4 mt-7 text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#9bbdac]/80">Menu</p>
                <nav className="space-y-1.5">
                    {menu.map((item) => (
                        <SidebarLink key={item.route} item={item} />
                    ))}
                </nav>

                <p className="mb-2 ml-4 mt-6 text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#9bbdac]/80">Akun</p>
                <nav className="space-y-1.5">
                    {accountMenu.map((item) => (
                        <SidebarLink key={item.route} item={item} />
                    ))}
                </nav>

                {/* Tips harian */}
                <div className="mt-7 rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur-sm">
                    <p className="flex items-center gap-2 text-xs font-bold text-[#4de097]">
                        <FontAwesomeIcon icon={faLightbulb} /> Tips hari ini
                    </p>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-[#d8eadf]">{tipOfTheDay(1)}</p>
                </div>
            </div>

            {/* Profil */}
            <div className="border-t border-white/10 bg-[#051d16]/60 p-4">
                <div className="flex items-center gap-3">
                    <Avatar name={user.name} src={user.avatar_url} className="h-10 w-10 ring-2 ring-white/20" />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{user.name}</p>
                        <p className="truncate text-xs text-[#9bbdac]">{user.email}</p>
                    </div>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-[#9bbdac] transition hover:bg-[#d9764a] hover:text-white"
                        aria-label="Keluar"
                        title="Keluar"
                    >
                        <FontAwesomeIcon icon={faRightFromBracket} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function Authenticated({
    header,
    live,
    children,
}: PropsWithChildren<{
    header?: ReactNode;
    /** Prop halaman yang ikut diperbarui otomatis (realtime), mis. ['stats', 'latestOrders']. */
    live?: string[];
}>) {
    const user = usePage<PageProps>().props.auth.user;
    const [mobileOpen, setMobileOpen] = useState(false);

    // Badge sidebar & jam selalu diperbarui; halaman dengan `live` juga memperbarui datanya.
    useLivePoll(live ?? ['counters'], live ? LIVE_INTERVAL : 30_000);

    // Tutup menu mobile setiap pindah halaman
    const url = usePage().url;
    useEffect(() => setMobileOpen(false), [url]);

    // Kunci scroll halaman saat drawer mobile terbuka
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    return (
        <div className="relative min-h-screen bg-[#f3f5ee] text-[#0c2b20]">
            {/* Sidebar desktop */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] lg:block">
                <Sidebar />
            </aside>

            {/* Drawer mobile */}
            <div className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}>
                <div
                    className={`absolute inset-0 bg-[#041b15]/50 backdrop-blur-sm transition-opacity duration-300 ${
                        mobileOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                    onClick={() => setMobileOpen(false)}
                />
                <aside
                    className={`absolute inset-y-0 left-0 w-[280px] max-w-[85vw] shadow-2xl transition-transform duration-300 ease-out ${
                        mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <Sidebar />
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white"
                        aria-label="Tutup menu"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </aside>
            </div>

            <div className="lg:pl-[272px]">
                {/* Topbar mobile */}
                <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#dfe7d9] bg-[#f3f5ee]/90 px-4 backdrop-blur-lg sm:px-6 lg:hidden">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="grid h-10 w-10 place-items-center rounded-xl bg-[#07271e] text-white shadow-soft"
                        aria-label="Buka menu"
                    >
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/landingpage/LOGO.png" alt="" aria-hidden="true" className="h-6 w-6 object-contain" />
                        <span className="text-lg font-extrabold tracking-tight">AISTEL</span>
                    </Link>
                    <Link href={route('profile.edit')} aria-label="Profil saya">
                        <Avatar name={user.name} src={user.avatar_url} />
                    </Link>
                </div>

                <main className="mx-auto max-w-[1280px] px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-8">
                    {header && <div className="mb-8">{header}</div>}
                    {children}
                </main>

                <Footer />
            </div>

            <FlashMessage />
        </div>
    );
}
