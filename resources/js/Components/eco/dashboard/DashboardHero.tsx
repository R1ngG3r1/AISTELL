import Avatar from '@/Components/eco/Avatar';
import { faCalendarDays, faClock, faLeaf } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useServerClock } from '@/lib/live';
import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { ReactNode } from 'react';

const zoneLabel: Record<string, string> = { 'Asia/Jakarta': 'WIB', 'Asia/Makassar': 'WITA', 'Asia/Jayapura': 'WIT' };

/**
 * Banner sambutan dashboard: ilustrasi lanskap (sama dengan halaman login)
 * dengan judul di kiri dan widget tanggal/jam di kanan.
 */
export default function DashboardHero({
    eyebrow,
    title,
    description,
    actions,
    userName,
}: {
    eyebrow?: ReactNode;
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    userName: string;
}) {
    // Jam berdetak tiap detik dan disinkronkan dengan jam server (lihat lib/live.ts).
    const { now, timeZone } = useServerClock();
    const avatarUrl = usePage<PageProps>().props.auth.user.avatar_url;

    return (
        <section className="relative overflow-hidden rounded-[28px] border border-[#dfe7d9] bg-[#eef3ea] shadow-soft">
            <img
                src="/img-login/gambar1.jpeg"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: '50% 58%' }}
            />
            {/* Gradasi agar teks tetap terbaca (di HP/tablet teks memenuhi lebar, jadi gradasinya lebih rata) */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#f5f7f2] via-[#f5f7f2]/90 to-[#f5f7f2]/55 lg:via-[#f5f7f2]/80 lg:to-transparent" />

            {/*
              HP     : maskot kecil di samping sapaan; deskripsi, tombol, dan jam selebar kartu di bawahnya.
              Tablet : maskot di samping seluruh teks; jam & avatar turun ke baris bawah.
              Desktop: satu baris - maskot + teks di kiri, jam & avatar di kanan.
            */}
            <div className="relative flex flex-col gap-5 p-5 sm:gap-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
                <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-4 sm:gap-x-6">
                    <img
                        src="/img-dashboard/maskot.webp"
                        alt="Maskot AISTEL"
                        draggable={false}
                        className="h-28 w-auto shrink-0 animate-float select-none drop-shadow-[0_10px_14px_rgba(7,39,30,0.18)] sm:row-span-2 sm:h-40 lg:h-44"
                    />

                    <div className="min-w-0 animate-fade-up sm:self-end">
                        {eyebrow && (
                            <p className="inline-flex items-center gap-2 rounded-full bg-[#287e59] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#e8f7ee] sm:text-[10.5px]">
                                <FontAwesomeIcon icon={faLeaf} /> {eyebrow}
                            </p>
                        )}
                        <h1 className="mt-2.5 break-words font-display text-[1.65rem] font-bold leading-tight tracking-tight text-[#0c2b20] sm:mt-3 sm:text-4xl">
                            {title}
                        </h1>
                    </div>

                    {(description || actions) && (
                        <div className="col-span-2 max-w-xl animate-fade-up sm:col-span-1 sm:col-start-2 sm:self-start">
                            {description && <p className="text-sm leading-relaxed text-[#4c6156] sm:text-[15px]">{description}</p>}
                            {/* HP: tombol berbagi lebar sama rata */}
                            {actions && (
                                <div className="mt-4 flex flex-wrap gap-2.5 sm:mt-5 sm:gap-3 [&>*]:flex-1 sm:[&>*]:flex-none">{actions}</div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex animate-fade-up items-center gap-3 [animation-delay:120ms] lg:shrink-0">
                    {/* HP/tablet: tanggal & jam satu baris selebar kartu; desktop: kotak dua baris */}
                    <div className="flex flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-1.5 rounded-2xl border border-white/70 bg-[#fbfcf8]/90 px-4 py-3 text-[13px] font-semibold text-[#0c2b20] shadow-soft backdrop-blur lg:block lg:flex-none">
                        <p className="flex items-center gap-2.5">
                            <FontAwesomeIcon icon={faCalendarDays} className="w-3.5 text-[#287e59]" />
                            {now.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone })}
                        </p>
                        <p className="flex items-center gap-2.5 tabular-nums lg:mt-1.5" aria-live="off">
                            <FontAwesomeIcon icon={faClock} className="w-3.5 text-[#287e59]" />
                            <time dateTime={now.toISOString()}>
                                {now
                                    .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone })
                                    .replace(/\./g, ':')}
                            </time>
                            <span className="text-[11px] font-bold text-[#287e59]">{zoneLabel[timeZone] ?? timeZone}</span>
                        </p>
                    </div>
                    <div className="hidden shrink-0 rounded-full border-4 border-[#fbfcf8] shadow-soft sm:block">
                        <Avatar name={userName} src={avatarUrl} className="!h-14 !w-14 !text-base lg:!h-16 lg:!w-16 lg:!text-lg" />
                    </div>
                </div>
            </div>
        </section>
    );
}
