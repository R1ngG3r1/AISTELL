import { Blob, FloatingLeaves, LogoMark, Sprout } from '@/Components/eco/Illustrations';
import { faArrowLeft, faHouse } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link } from '@inertiajs/react';

// Props dari bootstrap/app.php → withExceptions()->respond(...)
// Halaman ini tidak memakai AuthenticatedLayout karena tamu (belum login) juga bisa melihatnya,
// dan untuk 404 data `auth` tidak selalu tersedia.
interface Props {
    status: 403 | 404 | 500 | 503;
    message?: string | null;
    homeUrl: string;
}

const content: Record<Props['status'], { title: string; description: string }> = {
    403: { title: 'Akses ditolak', description: 'Anda tidak memiliki izin untuk membuka halaman ini.' },
    404: { title: 'Halaman tidak ditemukan', description: 'Sepertinya halaman ini sudah dipindahkan, atau memang belum pernah tumbuh di sini.' },
    500: { title: 'Terjadi kesalahan', description: 'Maaf, ada masalah di server kami. Silakan coba beberapa saat lagi.' },
    503: { title: 'Sedang perawatan', description: 'AISTEL sedang dirawat agar tetap segar. Silakan kembali sebentar lagi.' },
};

export default function Error({ status, message, homeUrl }: Props) {
    const { title, description } = content[status];

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-5">
            <Head title={title} />
            <Blob className="-left-24 -top-24 h-96 w-96 bg-leaf-200/60" />
            <Blob className="-bottom-24 -right-24 h-96 w-96 bg-forest-100 [animation-delay:-5s]" />
            <FloatingLeaves count={6} />

            <div className="relative w-full max-w-lg text-center">
                <Link href={homeUrl} className="group mb-10 inline-block">
                    <LogoMark />
                </Link>

                <div className="relative mx-auto flex w-fit animate-fade-up items-end justify-center">
                    <span className="display select-none text-[8rem] leading-none text-forest-900/10 sm:text-[11rem]">{status}</span>
                    <Sprout wilted={status !== 503} className="absolute bottom-0 h-32 w-32 sm:h-40 sm:w-40" />
                </div>

                <h1 className="display mt-6 animate-fade-up text-4xl text-forest-900 [animation-delay:80ms]">{title}</h1>
                <p className="mx-auto mt-3 max-w-sm animate-fade-up text-forest-900/60 [animation-delay:160ms]">{message || description}</p>

                <div className="mt-8 flex animate-fade-up justify-center gap-2 [animation-delay:240ms]">
                    <button type="button" onClick={() => window.history.back()} className="btn-ghost">
                        <FontAwesomeIcon icon={faArrowLeft} /> Kembali
                    </button>
                    <Link href={homeUrl} className="btn-primary">
                        <FontAwesomeIcon icon={faHouse} /> Ke Beranda
                    </Link>
                </div>
            </div>
        </div>
    );
}
