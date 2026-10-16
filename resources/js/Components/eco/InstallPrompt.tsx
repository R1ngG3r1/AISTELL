import { BeforeInstallPromptEvent, isIos, isStandalone, rememberDismissed, wasDismissedRecently } from '@/lib/pwa';
import { faDownload, faShareFromSquare, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';

/** Jeda sebelum ajakan muncul, agar tidak menutupi halaman saat pengguna baru tiba. */
const SHOW_DELAY_MS = 4000;

/**
 * Ajakan "Pasang aplikasi" di layar utama.
 * - Android/Chrome/Edge: memakai dialog pasang bawaan browser (beforeinstallprompt).
 * - iPhone/iPad (Safari): petunjuk menu Bagikan → Tambahkan ke Layar Utama.
 * - Tidak muncul bila sudah terpasang, atau sudah ditutup dalam 14 hari terakhir.
 */
export default function InstallPrompt() {
    const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
    const [iosHint, setIosHint] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isStandalone() || wasDismissedRecently()) return;

        let timer: number | undefined;
        const reveal = () => {
            timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
        };

        const onPrompt = (e: Event) => {
            e.preventDefault(); // tahan dialog otomatis; ditampilkan lewat tombol kita
            setInstallEvent(e as BeforeInstallPromptEvent);
            reveal();
        };
        const onInstalled = () => {
            setVisible(false);
            setInstallEvent(null);
        };

        window.addEventListener('beforeinstallprompt', onPrompt);
        window.addEventListener('appinstalled', onInstalled);

        if (isIos(navigator.userAgent)) {
            setIosHint(true);
            reveal();
        }

        return () => {
            window.clearTimeout(timer);
            window.removeEventListener('beforeinstallprompt', onPrompt);
            window.removeEventListener('appinstalled', onInstalled);
        };
    }, []);

    const dismiss = () => {
        rememberDismissed();
        setVisible(false);
    };

    const install = async () => {
        if (!installEvent) return;
        await installEvent.prompt();
        const { outcome } = await installEvent.userChoice;
        setInstallEvent(null);
        setVisible(false);
        if (outcome === 'dismissed') rememberDismissed();
    };

    if (!visible || (!installEvent && !iosHint)) return null;

    return (
        <aside
            role="dialog"
            aria-label="Pasang aplikasi AISTEL"
            className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-md rounded-3xl bg-forest-900 p-4 pr-12 text-cream shadow-lift ring-1 ring-white/10 sm:left-auto sm:right-6 sm:mx-0"
        >
            <button
                type="button"
                onClick={dismiss}
                aria-label="Tutup"
                className="absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full text-cream/60 transition hover:bg-white/10 hover:text-white"
            >
                <FontAwesomeIcon icon={faXmark} />
            </button>

            <div className="flex items-start gap-3">
                <img src="/pwa/icon-192.png" alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-xl" />
                <div className="min-w-0">
                    <p className="font-bold">Pasang AISTEL di HP Anda</p>
                    {installEvent ? (
                        <p className="mt-0.5 text-sm text-cream/70">Buka lebih cepat dari layar utama, tanpa mengetik alamat.</p>
                    ) : (
                        <p className="mt-0.5 text-sm text-cream/70">
                            Ketuk <FontAwesomeIcon icon={faShareFromSquare} className="mx-0.5 text-leaf-400" /> <strong>Bagikan</strong> di Safari, lalu pilih{' '}
                            <strong>Tambahkan ke Layar Utama</strong>.
                        </p>
                    )}
                </div>
            </div>

            {installEvent && (
                <button type="button" onClick={install} className="btn-leaf mt-3 w-full">
                    <FontAwesomeIcon icon={faDownload} /> Pasang aplikasi
                </button>
            )}
        </aside>
    );
}
