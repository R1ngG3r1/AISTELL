/*
| PWA: pendaftaran service worker dan logika tombol "Pasang aplikasi".
| Service worker-nya di public/sw.js (hanya menyimpan aset statis, tidak pernah data pengguna).
*/

const DISMISS_KEY = 'aistel.install.dismissedAt';
/** Setelah ditutup, ajakan pasang tidak muncul lagi selama sekian hari. */
export const DISMISS_DAYS = 14;

/** Daftarkan service worker. Hanya di build produksi agar tidak mengganggu HMR saat `npm run dev`. */
export function registerServiceWorker(): void {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Tidak fatal: aplikasi tetap berjalan normal tanpa service worker.
        });
    });
}

/** true bila aplikasi sedang dibuka sebagai aplikasi terpasang (bukan tab browser). */
export function isStandalone(): boolean {
    if (typeof window === 'undefined') return false;

    return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

/** iPhone/iPad: tidak ada dialog pasang otomatis, pengguna harus lewat menu Bagikan di Safari. */
export function isIos(userAgent: string): boolean {
    return /iphone|ipad|ipod/i.test(userAgent);
}

/** Pengguna sudah menutup ajakan baru-baru ini? Penyimpanan bisa tidak tersedia (mode privat), jadi dibungkus try. */
export function wasDismissedRecently(now = Date.now(), storage: Pick<Storage, 'getItem'> | null = safeStorage()): boolean {
    try {
        const at = Number(storage?.getItem(DISMISS_KEY));

        return Number.isFinite(at) && at > 0 && now - at < DISMISS_DAYS * 86_400_000;
    } catch {
        return false;
    }
}

export function rememberDismissed(now = Date.now(), storage: Pick<Storage, 'setItem'> | null = safeStorage()): void {
    try {
        storage?.setItem(DISMISS_KEY, String(now));
    } catch {
        // abaikan: paling buruk ajakannya muncul lagi
    }
}

function safeStorage(): Storage | null {
    try {
        return window.localStorage;
    } catch {
        return null;
    }
}

/** Event non-standar Chrome/Edge/Android untuk memunculkan dialog pasang. */
export interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
