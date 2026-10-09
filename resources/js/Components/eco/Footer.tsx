import { faEnvelope, faLocationDot, faPhone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

/**
 * Footer aplikasi dengan konten seperti landing page,
 * namun dengan styling card modern khas dashboard (deep forest green #07271e).
 */
export default function Footer() {
    const { auth } = usePage<PageProps>().props;
    const user = auth?.user;
    const isAdmin = user?.role === 'admin';

    return (
        <footer className="mx-auto max-w-[1280px] px-4 pb-8 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[28px] border border-[#0c2b20] bg-[#07271e] p-6 text-white shadow-soft sm:p-8 lg:p-10">
                <div className="grid gap-8 md:grid-cols-[1.6fr_1fr_1.2fr]">
                    {/* Kolom Brand */}
                    <div>
                        <div className="flex items-center gap-2.5">
                            <img
                                src="/landingpage/LOGO.png"
                                alt=""
                                aria-hidden="true"
                                className="h-7 w-7 object-contain"
                            />
                            <span className="font-display text-xl font-extrabold tracking-tight text-white">
                                AISTEL
                            </span>
                        </div>
                        <p className="mt-3.5 max-w-md text-xs leading-relaxed text-[#84a595] sm:text-[13px]">
                            Awareness Initiative for Sustainable Environment &amp; Living. Platform
                            layanan kebersihan dan perawatan lingkungan untuk masyarakat modern.
                        </p>
                    </div>

                    {/* Kolom Platform */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#4de097]">
                            Platform
                        </h3>
                        <ul className="mt-3.5 space-y-2.5 text-xs sm:text-[13px]">
                            {isAdmin ? (
                                <>
                                    <li>
                                        <Link href={route('admin.dashboard')} className="text-[#84a595] transition hover:text-white">
                                            Dashboard Admin
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('admin.orders.index')} className="text-[#84a595] transition hover:text-white">
                                            Kelola Pesanan
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('admin.services.index')} className="text-[#84a595] transition hover:text-white">
                                            Kelola Layanan
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('admin.helpdesk.index')} className="text-[#84a595] transition hover:text-white">
                                            Helpdesk
                                        </Link>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <Link href={route('dashboard')} className="text-[#84a595] transition hover:text-white">
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('services.index')} className="text-[#84a595] transition hover:text-white">
                                            Layanan
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('orders.index')} className="text-[#84a595] transition hover:text-white">
                                            Pesanan Saya
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('helpdesk.index')} className="text-[#84a595] transition hover:text-white">
                                            Helpdesk
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('profile.edit')} className="text-[#84a595] transition hover:text-white">
                                            Profil Saya
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Kolom Kontak */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#4de097]">
                            Kontak
                        </h3>
                        <ul className="mt-3.5 space-y-2.5 text-xs sm:text-[13px] text-[#84a595]">
                            <li>
                                <a
                                    href="mailto:hello@aistel.id"
                                    className="flex items-center gap-2.5 transition hover:text-white"
                                >
                                    <FontAwesomeIcon icon={faEnvelope} className="w-3.5 text-[#4de097]" />
                                    <span>hello@aistel.id</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="tel:+6281234567890"
                                    className="flex items-center gap-2.5 transition hover:text-white"
                                >
                                    <FontAwesomeIcon icon={faPhone} className="w-3.5 text-[#4de097]" />
                                    <span className="whitespace-nowrap">+62 812-3456-7890</span>
                                </a>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <FontAwesomeIcon icon={faLocationDot} className="w-3.5 text-[#4de097]" />
                                <span>Indonesia</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Baris Bawah: Hak Cipta & Slogan */}
                <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-[11px] text-[#84a595]/80 sm:flex-row">
                    <p>© {new Date().getFullYear()} AISTEL. All rights reserved.</p>
                    <p className="text-center sm:text-right">
                        Awareness Initiative for Sustainable Environment &amp; Living
                    </p>
                </div>
            </div>
        </footer>
    );
}
