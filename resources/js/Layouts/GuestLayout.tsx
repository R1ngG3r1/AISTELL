import { Link } from '@inertiajs/react';
import { PropsWithChildren, ReactNode } from 'react';

/*
 * Kelas bersama agar halaman tamu (lupa password, reset password, dst.)
 * serupa dengan halaman login di AuthLayoutUnified.
 */
export const authLabel = 'block text-xs sm:text-sm font-bold text-[#18231f] mb-1.5 ml-2';
export const authInput =
    'w-full h-12 sm:h-[50px] px-6 rounded-full border text-[#18231f] text-sm sm:text-base font-normal placeholder-[#4d6357] shadow-sm transition-all ' +
    'focus:outline-none focus:ring-2 focus:ring-[#3b9270]/40 focus:border-[#2e7d5b] ' +
    'bg-white/70 border-white/80 lg:bg-[#c5ddd1] lg:border-[#7ba794] lg:placeholder-[#647f72]';
export const authError = 'mt-1.5 ml-4 text-xs font-semibold text-rose-700';
export const authButton =
    'w-full h-12 sm:h-[50px] rounded-full border-[1.5px] text-base font-bold tracking-wide shadow-sm transition-all duration-200 flex items-center justify-center hover:shadow active:scale-[0.99] disabled:opacity-60 ' +
    'bg-[#14432f] border-[#14432f] text-white hover:bg-[#1c5a40] sm:bg-white sm:border-[#3b9270] sm:text-[#18231f] sm:hover:bg-[#f1f8f4]';
export const authStatus =
    'mb-6 rounded-2xl bg-[#c5ddd1]/80 border border-[#3b9270]/50 px-4 py-2.5 text-center text-xs sm:text-sm font-semibold text-[#18231f] shadow-sm';

/**
 * Layout halaman tamu (lupa password, reset password, konfirmasi password, verifikasi email).
 * Desktop: ilustrasi lanskap di kiri dengan lengkungan, form di kanan.
 * Tablet & mobile: ilustrasi memenuhi layar, form di atas panel transparan.
 */
export default function Guest({
    children,
    title,
    subtitle,
}: PropsWithChildren<{ title?: ReactNode; subtitle?: ReactNode }>) {
    return (
        <div className="relative min-h-screen w-full overflow-x-hidden bg-[#f5f7f2] font-sans text-[#18231f]">
            {/* Tablet & mobile: latar penuh */}
            <div className="pointer-events-none fixed inset-0 z-0 lg:hidden" aria-hidden="true">
                <img
                    src="/login/gambar1.jpeg"
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ objectPosition: '50% 20%' }}
                />
                <div className="absolute inset-0 bg-white/10" />
            </div>

            {/* Desktop: lanskap di kiri dengan lengkungan */}
            <div className="pointer-events-none fixed inset-0 z-0 hidden lg:block" aria-hidden="true">
                <div className="absolute inset-y-0 left-0 h-full w-[48%] overflow-hidden xl:w-[47%]">
                    <img
                        src="/login/gambar1.jpeg"
                        alt=""
                        className="h-full w-full"
                        style={{ objectFit: 'cover', objectPosition: '50% 5%' }}
                    />
                </div>
                <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                    <path
                        d="M 1000 0 L 1000 1000 L 415 1000 C 390 940, 365 840, 370 680 C 375 520, 465 380, 465 280 C 465 180, 440 60, 415 0 Z"
                        fill="#f5f7f2"
                    />
                </svg>
            </div>

            {/* Logo */}
            <header className="absolute left-5 top-5 z-30 flex items-center sm:left-8 sm:top-7 lg:left-10 xl:left-14 xl:top-9">
                <Link
                    href="/"
                    className="group inline-flex items-center gap-2 transition-transform duration-200 hover:scale-105 focus:outline-none sm:gap-2.5"
                >
                    <img
                        src="/landingpage/LOGO.png"
                        alt=""
                        aria-hidden="true"
                        className="h-6 w-6 object-contain transition-transform group-hover:rotate-6 sm:h-7 sm:w-7"
                    />
                    <span className="text-lg font-black tracking-tight text-[#18231f] sm:text-2xl">AISTEL</span>
                </Link>
            </header>

            {/* Konten */}
            <main className="relative z-20 flex min-h-screen items-center justify-center px-5 pb-10 pt-24 sm:px-10 sm:py-28 lg:ml-auto lg:w-[56%] lg:px-8 lg:py-16 xl:w-[57%] xl:px-14">
                <div className="my-auto flex w-full max-w-[400px] animate-fade-up flex-col justify-center rounded-3xl border border-white/50 bg-white/35 p-6 shadow-xl shadow-[#06241a]/10 backdrop-blur-md sm:max-w-[480px] sm:p-10 lg:max-w-[420px] lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
                    {title && (
                        <div className="mb-6 text-center sm:mb-8 lg:text-left">
                            <h1 className="text-3xl font-black leading-tight tracking-tight text-[#18231f] sm:text-[44px]">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="mt-2.5 text-xs font-normal leading-relaxed text-[#2f4a3d] sm:text-sm lg:text-[#4d6357]">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    )}
                    {children}
                </div>
            </main>
        </div>
    );
}
