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
    403: {
        title: 'Akses Ditolak',
        description: 'Anda tidak memiliki izin untuk membuka halaman ini.',
    },
    404: {
        title: 'Halaman Tidak Ditemukan',
        description: 'Halaman yang Anda cari tidak ada atau sudah dipindahkan.',
    },
    500: {
        title: 'Terjadi Kesalahan',
        description: 'Maaf, terjadi kesalahan pada server. Silakan coba beberapa saat lagi.',
    },
    503: {
        title: 'Sedang Perbaikan',
        description: 'AISTEL sedang dalam pemeliharaan. Silakan kembali beberapa saat lagi.',
    },
};

export default function Error({ status, message, homeUrl }: Props) {
    const { title, description } = content[status];

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <Head title={title} />

            <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-sm">
                <p className="text-6xl font-bold text-green-700">{status}</p>
                <h1 className="mt-4 text-xl font-semibold text-gray-900">{title}</h1>
                <p className="mt-2 text-sm text-gray-600">{message || description}</p>

                <div className="mt-6 flex justify-center gap-2">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="rounded-md border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        Kembali
                    </button>
                    <Link
                        href={homeUrl}
                        className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
                    >
                        Ke Beranda
                    </Link>
                </div>
            </div>
        </div>
    );
}
