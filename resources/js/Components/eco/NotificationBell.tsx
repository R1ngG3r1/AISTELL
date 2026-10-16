import { AppNotification, PageProps } from '@/types';
import { faBell, faClipboardList, faHeadset, faWallet } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';

const ICONS = { order: faClipboardList, payment: faWallet, helpdesk: faHeadset } as const;

/** "5 menit lalu", "kemarin", … */
function timeAgo(iso: string) {
    const diff = Math.round((Date.parse(iso) - Date.now()) / 1000);
    const rtf = new Intl.RelativeTimeFormat('id', { numeric: 'auto' });
    const units: [Intl.RelativeTimeFormatUnit, number][] = [
        ['day', 86400],
        ['hour', 3600],
        ['minute', 60],
    ];
    for (const [unit, secs] of units) {
        if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
    }
    return 'baru saja';
}

/**
 * Lonceng notifikasi. Jumlah belum dibaca ikut polling halaman (counters.notificationsUnread);
 * daftarnya dimuat saat panel dibuka dan dimuat ulang bila jumlahnya berubah.
 */
export default function NotificationBell({ className = '' }: { className?: string }) {
    const unread = usePage<PageProps>().props.counters?.notificationsUnread ?? 0;
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<AppNotification[] | null>(null);
    const [failed, setFailed] = useState(false);
    const root = useRef<HTMLDivElement>(null);

    const load = useCallback(() => {
        axios
            .get<{ items: AppNotification[] }>(route('notifications.index'))
            .then((res) => {
                setItems(res.data.items);
                setFailed(false);
            })
            .catch(() => setFailed(true));
    }, []);

    useEffect(() => {
        if (open) load();
    }, [open, unread, load]);

    // Tutup saat klik di luar atau tekan Esc
    useEffect(() => {
        if (!open) return;
        const onClick = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const refreshCounter = () => router.reload({ only: ['counters'] });

    const openItem = (n: AppNotification) => {
        setOpen(false);
        const go = () => router.visit(n.url);
        if (n.read) return go();
        axios.post(route('notifications.read', n.id)).finally(go);
    };

    const readAll = () => {
        axios.post(route('notifications.read-all')).then(() => {
            setItems((list) => list?.map((n) => ({ ...n, read: true })) ?? null);
            refreshCounter();
        });
    };

    return (
        <div ref={root} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="relative grid h-10 w-10 place-items-center rounded-xl border border-[#dfe7d9] bg-white text-[#07271e] shadow-soft transition hover:bg-[#f5f7f2]"
                aria-label={unread > 0 ? `Notifikasi, ${unread} belum dibaca` : 'Notifikasi'}
                aria-expanded={open}
            >
                <FontAwesomeIcon icon={faBell} />
                {unread > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#d9764a] px-1 text-[11px] font-bold tabular-nums text-white">
                        {unread > 99 ? '99+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full z-50 mt-2 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[#dfe7d9] bg-white shadow-[0_20px_40px_-12px_rgba(7,39,30,0.35)]">
                    <div className="flex items-center justify-between border-b border-[#eef2e9] px-4 py-3">
                        <p className="text-sm font-bold text-[#07271e]">Notifikasi</p>
                        {unread > 0 && (
                            <button type="button" onClick={readAll} className="text-xs font-semibold text-[#287e59] hover:underline">
                                Tandai semua dibaca
                            </button>
                        )}
                    </div>

                    <div className="max-h-[420px] overflow-y-auto">
                        {failed && <p className="px-4 py-8 text-center text-sm text-[#d9764a]">Gagal memuat notifikasi.</p>}
                        {!failed && items === null && <p className="px-4 py-8 text-center text-sm text-[#4c6156]">Memuat…</p>}
                        {!failed && items?.length === 0 && (
                            <p className="px-4 py-8 text-center text-sm text-[#4c6156]">Belum ada notifikasi.</p>
                        )}
                        {items?.map((n) => (
                            <button
                                key={n.id}
                                type="button"
                                onClick={() => openItem(n)}
                                className={`flex w-full gap-3 border-b border-[#f1f4ec] px-4 py-3 text-left transition last:border-0 hover:bg-[#f5f7f2] ${
                                    n.read ? '' : 'bg-[#f0f8f3]'
                                }`}
                            >
                                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#287e59]/10 text-sm text-[#287e59]">
                                    <FontAwesomeIcon icon={ICONS[n.kind] ?? faBell} />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="flex items-start justify-between gap-2">
                                        <span className="text-sm font-bold text-[#07271e]">{n.title}</span>
                                        {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#d9764a]" aria-label="Belum dibaca" />}
                                    </span>
                                    <span className="mt-0.5 block text-[13px] leading-snug text-[#4c6156]">{n.body}</span>
                                    <span className="mt-1 block text-[11px] text-[#7d9387]">{timeAgo(n.created_at)}</span>
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
