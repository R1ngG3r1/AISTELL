import Dropdown from '@/Components/Dropdown';
import Avatar from '@/Components/eco/Avatar';
import { Blob, Leaf, LogoMark } from '@/Components/eco/Illustrations';
import FlashMessage from '@/Components/FlashMessage';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { useScrolled } from '@/lib/motion';
import { PageProps } from '@/types';
import { faBars, faChevronDown, faRightFromBracket, faUser, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';

// Menu navigasi per role (PRD 6.2 User Area & 6.3 Admin Area).
// `active` = daftar pola nama route; menu menyala jika salah satunya cocok.
const userMenu = [
    { label: 'Dashboard', route: 'dashboard', active: ['dashboard'] },
    { label: 'Pesan Layanan', route: 'services.index', active: ['services.*', 'orders.create'] },
    { label: 'Pesanan Saya', route: 'orders.index', active: ['orders.index', 'orders.show'] },
];

const adminMenu = [
    { label: 'Dashboard', route: 'admin.dashboard', active: ['admin.dashboard'] },
    { label: 'Kelola Pesanan', route: 'admin.orders.index', active: ['admin.orders.*'] },
    { label: 'Kelola Layanan', route: 'admin.services.index', active: ['admin.services.*'] },
    { label: 'Pengguna', route: 'users.index', active: ['users.*'] },
];

const isActive = (patterns: string[]) => patterns.some((p) => route().current(p));

export default function Authenticated({ header, children }: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage<PageProps>().props.auth.user;
    const isAdmin = user.role === 'admin';
    const menu = isAdmin ? adminMenu : userMenu;
    const scrolled = useScrolled();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Tutup menu mobile setiap pindah halaman
    const url = usePage().url;
    useEffect(() => setMobileOpen(false), [url]);

    return (
        <div className="relative min-h-screen overflow-x-clip">
            {/* Dekorasi latar */}
            <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
                <Blob className="-right-32 -top-32 h-[28rem] w-[28rem] bg-leaf-200/50" />
                <Blob className="-left-40 top-1/3 h-[24rem] w-[24rem] bg-forest-100/60 [animation-delay:-4s]" />
                <div className="grain absolute inset-0" />
            </div>

            <nav
                className={`sticky top-0 z-40 transition-all duration-300 ${
                    scrolled ? 'bg-cream/80 shadow-soft backdrop-blur-lg' : 'bg-transparent'
                }`}
            >
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <Link href={route(isAdmin ? 'admin.dashboard' : 'dashboard')} className="group shrink-0">
                        <LogoMark />
                    </Link>

                    <div className="hidden items-center gap-1 rounded-full bg-white/70 p-1 shadow-soft ring-1 ring-forest-900/5 backdrop-blur md:flex">
                        {menu.map((item) => (
                            <NavLink key={item.route} href={route(item.route)} active={isActive(item.active)}>
                                {item.label}
                            </NavLink>
                        ))}
                    </div>

                    <div className="hidden md:block">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button
                                    type="button"
                                    className="flex items-center gap-2.5 rounded-full bg-white/70 py-1 pe-3 ps-1 shadow-soft ring-1 ring-forest-900/5 transition hover:bg-white"
                                >
                                    <Avatar name={user.name} />
                                    <span className="max-w-[9rem] truncate text-sm font-semibold">{user.name}</span>
                                    <FontAwesomeIcon icon={faChevronDown} className="text-xs text-forest-900/40" />
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <div className="px-3.5 pb-2 pt-2.5">
                                    <p className="truncate text-sm font-semibold">{user.name}</p>
                                    <p className="truncate text-xs text-forest-900/50">{user.email}</p>
                                    <span className="mt-2 inline-flex rounded-full bg-leaf-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-forest-700">
                                        {isAdmin ? 'Admin' : 'User'}
                                    </span>
                                </div>
                                <div className="my-1 h-px bg-forest-900/5" />
                                <Dropdown.Link href={route('profile.edit')}>
                                    <FontAwesomeIcon icon={faUser} className="w-4 text-forest-500" /> Profil Saya
                                </Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                    <FontAwesomeIcon icon={faRightFromBracket} className="w-4 text-clay-500" /> Keluar
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>

                    <button
                        onClick={() => setMobileOpen((v) => !v)}
                        className="grid h-10 w-10 place-items-center rounded-full bg-white/80 shadow-soft ring-1 ring-forest-900/5 md:hidden"
                        aria-label="Menu"
                    >
                        <FontAwesomeIcon icon={mobileOpen ? faXmark : faBars} />
                    </button>
                </div>

                {mobileOpen && (
                    <div className="animate-fade-up border-t border-forest-900/5 bg-cream/95 px-4 pb-5 pt-3 backdrop-blur-lg md:hidden">
                        <div className="space-y-1">
                            {menu.map((item) => (
                                <ResponsiveNavLink key={item.route} href={route(item.route)} active={isActive(item.active)}>
                                    {item.label}
                                </ResponsiveNavLink>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft">
                            <Avatar name={user.name} />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">{user.name}</p>
                                <p className="truncate text-xs text-forest-900/50">{user.email}</p>
                            </div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            <Link href={route('profile.edit')} className="btn-ghost">
                                Profil
                            </Link>
                            <Link href={route('logout')} method="post" as="button" className="btn-ghost text-clay-600">
                                Keluar
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
                {header && <div className="mb-8">{header}</div>}
                {children}
            </main>

            <footer className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 border-t border-forest-900/5 px-4 py-6 text-xs text-forest-900/45 sm:flex-row sm:px-6 lg:px-8">
                <span className="inline-flex items-center gap-1.5">
                    <Leaf className="h-3.5 w-3.5 text-forest-400" /> AISTEL · Clean Space, Better Living
                </span>
                <span>© {new Date().getFullYear()} Awareness Initiative for Sustainable Environment &amp; Living</span>
            </footer>

            <FlashMessage />
        </div>
    );
}
