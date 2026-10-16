import ConfirmModal from '@/Components/eco/ConfirmModal';
import { GoogleMapsLink } from '@/Components/eco/map';
import { toLatLng } from '@/lib/geo';
import { Address } from '@/types';
import { faLocationDot, faMapLocationDot, faPen, faPlus, faStar, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import AddressFormModal from './AddressFormModal';

const MAX_ADDRESSES = 10; // sama dengan AddressService::MAX_PER_USER

/** Buku alamat ala e-commerce: banyak alamat, satu alamat utama untuk pemesanan. */
export default function AddressBook({ addresses, className = '' }: { addresses: Address[]; className?: string }) {
    // undefined = modal tertutup, null = tambah alamat, Address = ubah alamat
    const [editing, setEditing] = useState<Address | null | undefined>(undefined);
    const [deleting, setDeleting] = useState<Address | null>(null);
    const [processing, setProcessing] = useState(false);
    // Angka ini menjadi key modal → form direset setiap kali dibuka.
    const [formKey, setFormKey] = useState(0);

    const open = (address: Address | null) => {
        setFormKey((k) => k + 1);
        setEditing(address);
    };
    const close = useCallback(() => setEditing(undefined), []);

    const makePrimary = (a: Address) => router.patch(route('addresses.primary', a.id), {}, { preserveScroll: true });

    const destroy = () => {
        if (!deleting) return;
        router.delete(route('addresses.destroy', deleting.id), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setDeleting(null);
            },
        });
    };

    return (
        <section className={className}>
            <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="display text-2xl">Alamat saya</h2>
                    <p className="mt-1 text-sm text-forest-900/55">Alamat utama otomatis terisi sebagai lokasi layanan saat Anda memesan.</p>
                </div>
                <button type="button" onClick={() => open(null)} disabled={addresses.length >= MAX_ADDRESSES} className="btn-primary btn-sm">
                    <FontAwesomeIcon icon={faPlus} /> Tambah alamat
                </button>
            </header>

            {addresses.length === 0 ? (
                <button
                    type="button"
                    onClick={() => open(null)}
                    className="mt-6 flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-forest-900/15 px-6 py-10 text-center transition hover:border-forest-500/50 hover:bg-forest-50/50"
                >
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-leaf-100 text-lg text-forest-700">
                        <FontAwesomeIcon icon={faMapLocationDot} />
                    </span>
                    <span className="mt-3 font-bold text-forest-900">Belum ada alamat tersimpan</span>
                    <span className="mt-1 text-sm text-forest-900/55">Tambahkan alamat rumah, kantor, atau lokasi lain beserta titik petanya.</span>
                </button>
            ) : (
                <ul className="mt-6 space-y-3">
                    {addresses.map((a) => {
                        const point = toLatLng(a);
                        return (
                            <li
                                key={a.id}
                                className={`rounded-2xl bg-white p-4 ring-1 transition md:p-5 ${a.is_primary ? 'ring-2 ring-forest-500/60' : 'ring-forest-900/10'}`}
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-bold text-forest-900">{a.label}</span>
                                    {a.is_primary && (
                                        <span className="rounded-full bg-forest-900 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-leaf-400">Utama</span>
                                    )}
                                </div>
                                <p className="mt-1.5 whitespace-pre-line break-words text-sm text-forest-900/75">{a.address}</p>
                                {a.detail && <p className="mt-1 text-sm text-forest-900/50">{a.detail}</p>}
                                <p className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${point ? 'text-forest-600' : 'text-sun-600'}`}>
                                    <FontAwesomeIcon icon={faLocationDot} />
                                    {point ? 'Titik peta tersimpan' : 'Belum ada titik peta - ubah alamat untuk menambahkannya'}
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2 border-t border-forest-900/5 pt-4">
                                    <button type="button" onClick={() => open(a)} className="btn-ghost btn-sm">
                                        <FontAwesomeIcon icon={faPen} /> Ubah
                                    </button>
                                    {!a.is_primary && (
                                        <button type="button" onClick={() => makePrimary(a)} className="btn-ghost btn-sm">
                                            <FontAwesomeIcon icon={faStar} /> Jadikan utama
                                        </button>
                                    )}
                                    {point && <GoogleMapsLink point={point} />}
                                    <button
                                        type="button"
                                        onClick={() => setDeleting(a)}
                                        className="btn btn-sm ms-auto text-clay-600 hover:bg-clay-100"
                                    >
                                        <FontAwesomeIcon icon={faTrashCan} /> Hapus
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {editing !== undefined && (
                <AddressFormModal key={formKey} show address={editing} isFirst={addresses.length === 0} onClose={close} />
            )}

            <ConfirmModal
                show={!!deleting}
                tone="danger"
                icon={faTrashCan}
                title={`Hapus alamat "${deleting?.label}"?`}
                message={deleting?.is_primary ? 'Ini alamat utama Anda. Alamat lain yang terbaru akan menjadi alamat utama.' : undefined}
                confirmText="Ya, hapus"
                processing={processing}
                onConfirm={destroy}
                onClose={() => setDeleting(null)}
            />
        </section>
    );
}
