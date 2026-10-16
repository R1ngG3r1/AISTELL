import { OrderFilters, StatusOption } from '@/types';
import { faMagnifyingGlass, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface Props {
    /** Nama route daftar pesanan: 'orders.index' atau 'admin.orders.index'. */
    routeName: string;
    filters: OrderFilters;
    statuses: StatusOption[];
    /** Daftar layanan untuk filter layanan (hanya admin). */
    services?: { id: number; name: string }[];
    /** Tampilkan filter status bayar (hanya admin). */
    showPayment?: boolean;
    searchPlaceholder?: string;
}

type Key = keyof OrderFilters;

/**
 * Pencarian + filter daftar pesanan. Semua pilihan disimpan di query string
 * (?status=&q=&service=&from=&to=&payment=) sehingga bisa di-bookmark dan tetap
 * ada saat halaman dimuat ulang atau di-polling.
 */
export default function OrderFilterBar({ routeName, filters, statuses, services, showPayment, searchPlaceholder = 'Cari pesanan…' }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const latest = useRef(filters);
    latest.current = filters;

    const visit = (next: Partial<Record<Key, string>>) => {
        const merged: Record<string, string> = {};
        (Object.keys(latest.current) as Key[]).forEach((k) => {
            const v = k in next ? next[k] : latest.current[k];
            if (v !== null && v !== undefined && v !== '') merged[k] = String(v);
        });
        router.get(route(routeName), merged, { preserveState: true, preserveScroll: true, replace: true });
    };

    // Pencarian menunggu pengguna berhenti mengetik agar tidak memanggil server di tiap huruf.
    useEffect(() => {
        if (q.trim() === (latest.current.q ?? '')) return;
        const t = window.setTimeout(() => visit({ q: q.trim() }), 350);
        return () => window.clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    const active = (Object.keys(filters) as Key[]).some((k) => filters[k]);
    const reset = () => {
        setQ('');
        router.get(route(routeName), {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const tabs = [{ value: '', label: 'Semua' }, ...statuses];
    const current = filters.status ?? '';
    const field = 'input h-11 py-0 text-sm';

    return (
        <div className="mb-5 space-y-3">
            {/* Tab status */}
            <div className="grid grid-cols-3 gap-1.5 rounded-3xl bg-white/70 p-1.5 shadow-soft ring-1 ring-forest-900/5 sm:inline-flex sm:gap-1 sm:rounded-full sm:p-1">
                {tabs.map((t) => (
                    <button
                        key={t.value}
                        type="button"
                        onClick={() => visit({ status: t.value })}
                        className={`whitespace-nowrap rounded-full px-2 py-2 text-center text-sm font-semibold transition sm:px-4 ${
                            current === t.value ? 'bg-forest-900 text-cream shadow-soft' : 'text-forest-900/60 hover:bg-forest-900/5'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap items-end gap-3">
                <label className="relative block w-full sm:w-72">
                    <span className="sr-only">Cari</span>
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-forest-900/35" />
                    <input
                        type="search"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder={searchPlaceholder}
                        maxLength={100}
                        className={`${field} rounded-full ps-10`}
                    />
                </label>

                {services && (
                    <label className="block">
                        <span className="sr-only">Layanan</span>
                        <select value={filters.service ?? ''} onChange={(e) => visit({ service: e.target.value })} className={`${field} w-auto min-w-40`}>
                            <option value="">Semua layanan</option>
                            {services.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </label>
                )}

                {showPayment && (
                    <label className="block">
                        <span className="sr-only">Status bayar</span>
                        <select value={filters.payment ?? ''} onChange={(e) => visit({ payment: e.target.value })} className={`${field} w-auto min-w-36`}>
                            <option value="">Semua pembayaran</option>
                            <option value="lunas">Sudah lunas</option>
                            <option value="belum">Belum lunas</option>
                        </select>
                    </label>
                )}

                <div className="flex items-center gap-2">
                    <label className="block">
                        <span className="mb-0.5 block text-[11px] font-semibold uppercase tracking-wider text-forest-900/40">Jadwal dari</span>
                        <input type="date" value={filters.from ?? ''} max={filters.to ?? undefined} onChange={(e) => visit({ from: e.target.value })} className={field} />
                    </label>
                    <label className="block">
                        <span className="mb-0.5 block text-[11px] font-semibold uppercase tracking-wider text-forest-900/40">Sampai</span>
                        <input type="date" value={filters.to ?? ''} min={filters.from ?? undefined} onChange={(e) => visit({ to: e.target.value })} className={field} />
                    </label>
                </div>

                {active && (
                    <button type="button" onClick={reset} className="btn-ghost btn-sm h-11">
                        <FontAwesomeIcon icon={faRotateLeft} /> Reset
                    </button>
                )}
            </div>
        </div>
    );
}
