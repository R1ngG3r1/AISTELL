import { PageProps } from '@/types';
import { usePage, usePoll } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

/*
| Fitur "realtime" tanpa WebSocket:
|   useServerClock() → jam yang berdetak tiap detik, disinkronkan dengan jam server (WIB)
|   useLivePoll()    → memuat ulang sebagian data halaman secara berkala (Inertia partial reload)
*/

/** Interval polling data (ms). Cukup cepat untuk status pesanan, tetap ringan untuk server. */
export const LIVE_INTERVAL = 10_000;

/**
 * Jam realtime. Server mengirim `clock.now` di setiap respons (termasuk polling);
 * selisihnya dengan jam perangkat disimpan, lalu jam berdetak sendiri tiap detik.
 * Hasilnya tetap akurat walaupun jam perangkat pengguna salah setel.
 */
export function useServerClock() {
    const { clock } = usePage<PageProps>().props;
    const offset = useMemo(() => (clock?.now ? Date.parse(clock.now) - Date.now() : 0), [clock?.now]);
    const [now, setNow] = useState(() => new Date(Date.now() + offset));

    useEffect(() => {
        const tick = () => setNow(new Date(Date.now() + offset));
        tick();
        const id = window.setInterval(tick, 1000);
        // Browser memperlambat timer di tab yang tidak aktif → langsung sinkron saat tab dibuka lagi.
        document.addEventListener('visibilitychange', tick);
        return () => {
            window.clearInterval(id);
            document.removeEventListener('visibilitychange', tick);
        };
    }, [offset]);

    return { now, timeZone: clock?.timezone ?? 'Asia/Jakarta' };
}

/** "YYYY-MM-DD" untuk tanggal di zona waktu tertentu. */
export function dateKey(date: Date, timeZone: string) {
    return date.toLocaleDateString('en-CA', { timeZone });
}

/**
 * Muat ulang prop tertentu secara berkala, mis. useLivePoll(['stats', 'latestOrders']).
 * Prop `clock` & `counters` selalu ikut diperbarui (Inertia::always di backend).
 * Polling otomatis melambat saat tab tidak aktif.
 */
export function useLivePoll(only: string[], interval = LIVE_INTERVAL) {
    usePoll(interval, { only, showProgress: false });
}
