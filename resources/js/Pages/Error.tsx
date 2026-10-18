import { Blob, FloatingLeaves, LogoMark } from '@/Components/eco/Illustrations';
import { PageProps } from '@/types';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
    faArrowLeft,
    faArrowRightToBracket,
    faClipboardList,
    faHeadset,
    faHouse,
    faLayerGroup,
    faListCheck,
    faLock,
    faMagnifyingGlass,
    faRotateRight,
    faScrewdriverWrench,
    faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link, usePage } from '@inertiajs/react';

// Props dari bootstrap/app.php → withExceptions()->respond(...)
// Halaman ini tidak memakai AuthenticatedLayout karena tamu (belum login) juga bisa melihatnya.
interface Props {
    status: 403 | 404 | 500 | 503;
    message?: string | null;
    homeUrl: string;
}

interface Content {
    title: string;
    description: string;
    /** Ucapan maskot di gelembung percakapan. */
    bubble: string;
    icon: IconDefinition;
    /** Warna gelembung & lencana ikon. */
    tone: string;
}

const content: Record<Props['status'], Content> = {
    403: {
        title: 'Akses ditolak',
        description: 'Area ini khusus untuk akun tertentu. Pastikan Anda masuk dengan akun yang tepat, atau kembali ke halaman utama.',
        bubble: 'Eits, area ini dijaga!',
        icon: faLock,
        tone: 'bg-clay-500',
    },
    404: {
        title: 'Halaman tidak ditemukan',
        description: 'Sepertinya halaman ini sudah dipindahkan, atau memang belum pernah tumbuh di sini. Cek kembali alamatnya ya.',
        bubble: 'Hmm, aku sudah cari ke mana-mana…',
        icon: faMagnifyingGlass,
        tone: 'bg-forest-500',
    },
    500: {
        title: 'Terjadi kesalahan',
        description: 'Maaf, ada masalah di server kami. Tim kami sudah dikabari. Silakan coba lagi beberapa saat.',
        bubble: 'Ups, ada yang tersangkut di kebun!',
        icon: faTriangleExclamation,
        tone: 'bg-clay-500',
    },
    503: {
        title: 'Sedang perawatan',
        description: 'AISTEL sedang dirawat agar tetap segar. Silakan kembali sebentar lagi.',
        bubble: 'Lagi rapikan taman, sebentar ya!',
        icon: faScrewdriverWrench,
        tone: 'bg-forest-500',
    },
};

/** Pintasan untuk pengguna yang sudah masuk, sesuai peran. */
function shortcuts(role: 'user' | 'admin'): { label: string; href: string; icon: IconDefinition }[] {
    return role === 'admin'
        ? [
              { label: 'Kelola Pesanan', href: route('admin.orders.index'), icon: faListCheck },
              { label: 'Kelola Layanan', href: route('admin.services.index'), icon: faLayerGroup },
              { label: 'Helpdesk', href: route('admin.helpdesk.index'), icon: faHeadset },
          ]
        : [
              { label: 'Layanan', href: route('services.index'), icon: faLayerGroup },
              { label: 'Pesanan Saya', href: route('orders.index'), icon: faClipboardList },
              { label: 'Helpdesk', href: route('helpdesk.index'), icon: faHeadset },
          ];
}

export default function Error({ status, message, homeUrl }: Props) {
    const { title, description, bubble, icon, tone } = content[status];
    // Untuk 404 data `auth` bisa tidak ada, jadi dibaca dengan aman.
    const user = usePage<PageProps>().props.auth?.user;
    const isServerError = status === 500 || status === 503;

    return (
        <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-cream">
            <Head title={`${status} · ${title}`} />
            <Blob className="-left-24 -top-24 h-96 w-96 bg-leaf-200/60" />
            <Blob className="-bottom-24 -right-24 h-[28rem] w-[28rem] bg-forest-100 [animation-delay:-5s]" />
            <FloatingLeaves count={8} />

            <header className="relative px-6 pt-6 sm:px-10 sm:pt-8">
                <Link href={homeUrl} className="group inline-block" aria-label="AISTEL, ke beranda">
                    <LogoMark />
                </Link>
            </header>

            <main className="relative mx-auto grid w-full max-w-5xl flex-1 items-center gap-6 px-6 py-10 sm:px-10 lg:grid-cols-2 lg:gap-12">
                {/* Maskot: di mobile di atas teks, di desktop di kanan */}
                <div className="relative order-first mx-auto w-full max-w-[19rem] animate-fade-up sm:max-w-sm lg:order-last lg:max-w-md">
                    <span
                        aria-hidden
                        className="display pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center text-[9rem] leading-none text-forest-900/[0.07] sm:text-[12rem] lg:text-[14rem]"
                    >
                        {status}
                    </span>

                    {/* Gelembung ucapan */}
                    <div className="absolute -top-2 left-0 z-10 flex max-w-[13rem] animate-float items-center gap-2.5 rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5 shadow-lift ring-1 ring-forest-900/5 sm:-left-4 sm:max-w-[15rem]">
                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-sm text-white ${tone}`}>
                            <FontAwesomeIcon icon={icon} />
                        </span>
                        <p className="text-sm font-semibold leading-snug text-forest-900">{bubble}</p>
                    </div>

                    <img
                        src="/img-dashboard/maskot.webp"
                        alt="Maskot AISTEL, burung hijau penjaga lingkungan"
                        width={407}
                        height={600}
                        className="relative mx-auto h-auto w-[78%] animate-float drop-shadow-[0_24px_30px_rgba(7,39,30,0.25)] [animation-delay:-2s]"
                    />
                    <div aria-hidden className="mx-auto -mt-3 h-4 w-3/5 rounded-[50%] bg-forest-900/15 blur-md" />
                </div>

                <div className="animate-fade-up text-center [animation-delay:100ms] lg:text-left">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-forest-500">Kode {status}</p>
                    <h1 className="display mt-2 text-4xl text-forest-900 sm:text-5xl">{title}</h1>
                    <p className="mx-auto mt-4 max-w-md text-forest-900/65 lg:mx-0">{message || description}</p>

                    <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                        {isServerError ? (
                            <button type="button" onClick={() => window.location.reload()} className="btn-primary">
                                <FontAwesomeIcon icon={faRotateRight} /> Coba lagi
                            </button>
                        ) : (
                            <button type="button" onClick={() => window.history.back()} className="btn-ghost">
                                <FontAwesomeIcon icon={faArrowLeft} /> Kembali
                            </button>
                        )}
                        <Link href={homeUrl} className={isServerError ? 'btn-ghost' : 'btn-primary'}>
                            <FontAwesomeIcon icon={faHouse} /> Ke Beranda
                        </Link>
                        {!user && status === 403 && (
                            <Link href={route('login')} className="btn-ghost">
                                <FontAwesomeIcon icon={faArrowRightToBracket} /> Masuk
                            </Link>
                        )}
                    </div>

                    {user && status !== 503 && (
                        <div className="mt-8">
                            <p className="text-xs font-semibold uppercase tracking-wider text-forest-900/40">Atau menuju</p>
                            <div className="mt-3 flex flex-wrap justify-center gap-2 lg:justify-start">
                                {shortcuts(user.role).map((s) => (
                                    <Link
                                        key={s.href}
                                        href={s.href}
                                        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-forest-900 shadow-soft ring-1 ring-forest-900/5 transition hover:-translate-y-0.5 hover:shadow-lift"
                                    >
                                        <FontAwesomeIcon icon={s.icon} className="text-forest-500" /> {s.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
