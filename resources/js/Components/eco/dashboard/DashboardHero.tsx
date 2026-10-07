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
                src="/login/gambar1.jpeg"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: '50% 58%' }}
            />
            {/* Gradasi agar teks di kiri tetap terbaca */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#f5f7f2] via-[#f5f7f2]/90 to-[#f5f7f2]/10 md:via-[#f5f7f2]/80 md:to-transparent" />

            <div className="relative flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:justify-between lg:p-10">
                <div className="max-w-xl animate-fade-up">
                    {eyebrow && (
                        <p className="inline-flex items-center gap-2 rounded-full bg-[#287e59] px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#e8f7ee]">
                            <FontAwesomeIcon icon={faLeaf} /> {eyebrow}
                        </p>
                    )}
                    <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-[#0c2b20] sm:text-4xl">
                        {title}
                    </h1>
                    {description && <p className="mt-2 text-sm leading-relaxed text-[#4c6156] sm:text-[15px]">{description}</p>}
                    {actions && <div className="mt-5 flex flex-wrap gap-3">{actions}</div>}
                </div>

                <div className="flex shrink-0 animate-fade-up items-center gap-3 self-start [animation-delay:120ms] md:self-auto">
                    <div className="rounded-2xl border border-white/70 bg-[#fbfcf8]/90 px-4 py-3 text-[13px] font-semibold text-[#0c2b20] shadow-soft backdrop-blur">
                        <p className="flex items-center gap-2.5">
                            <FontAwesomeIcon icon={faCalendarDays} className="w-3.5 text-[#287e59]" />
                            {now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone })}
                        </p>
                        <p className="mt-1.5 flex items-center gap-2.5 capitalize">
                            <FontAwesomeIcon icon={faLeaf} className="w-3.5 text-[#287e59]" />
                            {now.toLocaleDateString('id-ID', { weekday: 'long', timeZone })}
                        </p>
                        <p className="mt-1.5 flex items-center gap-2.5 tabular-nums" aria-live="off">
                            <FontAwesomeIcon icon={faClock} className="w-3.5 text-[#287e59]" />
                            <time dateTime={now.toISOString()}>
                                {now
                                    .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone })
                                    .replace(/\./g, ':')}
                            </time>
                            <span className="text-[11px] font-bold text-[#287e59]">{zoneLabel[timeZone] ?? timeZone}</span>
                        </p>
                    </div>
                    <div className="hidden rounded-full border-4 border-[#fbfcf8] shadow-soft sm:block">
                        <Avatar name={userName} src={avatarUrl} className="!h-16 !w-16 !text-lg" />
                    </div>
                </div>
            </div>
        </section>
    );
}
