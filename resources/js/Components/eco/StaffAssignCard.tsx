import InputError from '@/Components/InputError';
import { Reveal } from '@/lib/motion';
import StaffTypeBadge, { staffRoleLabel } from '@/Components/eco/StaffTypeBadge';
import { Order, StaffOption } from '@/types';
import { faCircleExclamation, faPhone, faUserCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/**
 * Kartu "Petugas" di detail pesanan admin: pilih petugas lalu simpan.
 * Petugas yang jadwalnya bentrok ditandai dan tidak bisa dipilih (backend juga menolak).
 */
export default function StaffAssignCard({ order, options }: { order: Order; options: StaffOption[] }) {
    const { errors } = usePage().props as { errors: Record<string, string> };
    const current = order.staff_id ?? null;
    const [selected, setSelected] = useState<string>(current ? String(current) : '');
    const [processing, setProcessing] = useState(false);

    // Ikuti perubahan dari server (polling / setelah simpan)
    useEffect(() => setSelected(current ? String(current) : ''), [current]);

    const editable = order.status === 'menunggu' || order.status === 'diproses';
    const dirty = selected !== (current ? String(current) : '');
    const picked = options.find((o) => String(o.id) === selected);

    const save = () =>
        router.put(
            route('admin.orders.staff', order.id),
            { staff_id: selected ? Number(selected) : null },
            { preserveScroll: true, onStart: () => setProcessing(true), onFinish: () => setProcessing(false) },
        );

    return (
        <Reveal variant="right" delay={30} className="card p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest-900/40">Petugas</p>

            {!editable ? (
                <p className="mt-3 text-sm text-forest-900/60">
                    {order.staff ? (
                        <span className="flex flex-wrap items-center gap-2">
                            {order.staff.name} · {order.staff.phone} <StaffTypeBadge type={order.staff.type} />
                        </span>
                    ) : (
                        `Pesanan ${order.status_label.toLowerCase()}, tidak ada petugas.`
                    )}
                </p>
            ) : options.length === 0 ? (
                <p className="mt-3 text-sm text-forest-900/60">
                    Belum ada petugas aktif. Tambahkan dulu di menu <strong>Kelola Petugas</strong>.
                </p>
            ) : (
                <>
                    <label className="mt-3 block">
                        <span className="sr-only">Pilih petugas</span>
                        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="input">
                            <option value="">- Belum ada petugas -</option>
                            {options.map((o) => (
                                <option key={o.id} value={o.id} disabled={!!o.busy}>
                                    {o.name} ({o.type === 'tim' ? 'Tim' : 'Solo'})
                                    {!o.is_active ? ' (nonaktif)' : ''}
                                    {o.busy ? ' - jadwal bentrok' : ''}
                                </option>
                            ))}
                        </select>
                    </label>

                    {picked && (
                        <div className="mt-2 space-y-1.5 text-sm text-forest-900/60">
                            <p className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faPhone} className="text-forest-400" /> {picked.phone}
                            </p>
                            <p className="flex flex-wrap items-center gap-2">
                                <StaffTypeBadge type={picked.type} /> {staffRoleLabel(picked.type)}
                            </p>
                        </div>
                    )}

                    {/* Alasan bentrok untuk petugas yang tidak bisa dipilih */}
                    {options.some((o) => o.busy) && (
                        <ul className="mt-3 space-y-1.5 rounded-2xl bg-clay-100 p-3 text-xs text-clay-600">
                            {options
                                .filter((o) => o.busy)
                                .map((o) => (
                                    <li key={o.id} className="flex gap-2">
                                        <FontAwesomeIcon icon={faCircleExclamation} className="mt-0.5 shrink-0" /> {o.busy}
                                    </li>
                                ))}
                        </ul>
                    )}

                    <InputError message={errors.staff_id} className="mt-2" />

                    <button type="button" onClick={save} disabled={!dirty || processing} className="btn-primary mt-4 w-full disabled:opacity-50">
                        <FontAwesomeIcon icon={faUserCheck} /> {processing ? 'Menyimpan…' : selected ? 'Tugaskan' : 'Lepas petugas'}
                    </button>
                </>
            )}
        </Reveal>
    );
}
