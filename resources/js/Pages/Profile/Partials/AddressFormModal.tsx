import { LocationPicker } from '@/Components/eco/map';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import { toLatLng } from '@/lib/geo';
import { Address } from '@/types';
import { faMapLocationDot, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const LABELS = ['Rumah', 'Kantor', 'Kos', 'Apartemen'];

/**
 * Tambah / ubah alamat. `address` null = alamat baru.
 * Dirender ulang (key) setiap kali dibuka, sehingga isi form selalu segar.
 */
export default function AddressFormModal({
    show,
    address,
    isFirst,
    onClose,
}: {
    show: boolean;
    address: Address | null;
    isFirst: boolean; // alamat pertama otomatis menjadi alamat utama
    onClose: () => void;
}) {
    const { data, setData, post, put, processing, errors, transform } = useForm({
        label: address?.label ?? 'Rumah',
        address: address?.address ?? '',
        detail: address?.detail ?? '',
        latitude: address?.latitude ?? (null as number | null),
        longitude: address?.longitude ?? (null as number | null),
        is_primary: address?.is_primary ?? isFirst,
    });

    const point = toLatLng(data);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        transform((d) => ({ ...d, detail: d.detail || null }));
        const options = { preserveScroll: true, onSuccess: onClose };
        if (address) {
            put(route('addresses.update', address.id), options); // → PUT /addresses/{id}
        } else {
            post(route('addresses.store'), options); // → POST /addresses
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="4xl">
            {/* Header & footer tetap; hanya isi yang di-scroll bila layar pendek */}
            <form onSubmit={submit} className="flex max-h-[calc(100dvh-2rem)] flex-col sm:max-h-[calc(100dvh-3rem)]">
                <div className="flex items-start justify-between gap-4 border-b border-forest-900/5 px-6 py-5 md:px-7">
                    <div className="flex items-center gap-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-leaf-100 text-forest-700">
                            <FontAwesomeIcon icon={faMapLocationDot} />
                        </span>
                        <div>
                            <h3 className="display text-xl text-forest-900 md:text-2xl">{address ? 'Ubah alamat' : 'Tambah alamat baru'}</h3>
                            <p className="text-sm text-forest-900/55">Tentukan titik di peta agar petugas mudah menemukan lokasi Anda.</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-forest-900/50 transition hover:bg-forest-50" aria-label="Tutup">
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto px-6 py-6 md:px-7 lg:grid-cols-[1.15fr_1fr]">
                    {/* Kiri: peta */}
                    <div>
                        <InputLabel value="Titik lokasi" />
                        <LocationPicker
                            value={point}
                            onChange={(p) => setData((d) => ({ ...d, latitude: p.lat, longitude: p.lng }))}
                            onAddress={(text) => setData('address', text)}
                            className="h-56 sm:h-64 lg:h-[19rem]"
                        />
                        <InputError message={errors.latitude || errors.longitude} className="mt-2" />
                    </div>

                    {/* Kanan: data alamat */}
                    <div className="space-y-5">
                        <div>
                            <InputLabel htmlFor="label" value="Label alamat" />
                            <div className="flex flex-wrap gap-2">
                                {LABELS.map((l) => (
                                    <button
                                        type="button"
                                        key={l}
                                        onClick={() => setData('label', l)}
                                        className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition ${
                                            data.label === l ? 'bg-forest-900 text-cream ring-forest-900' : 'bg-white text-forest-900/70 ring-forest-900/15 hover:ring-forest-500/50'
                                        }`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                            <TextInput
                                id="label"
                                value={data.label}
                                maxLength={50}
                                onChange={(e) => setData('label', e.target.value)}
                                placeholder="Atau tulis label sendiri, mis. Rumah Orang Tua"
                                className="mt-2"
                            />
                            <InputError message={errors.label} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="address_text" value="Alamat lengkap" />
                            <textarea
                                id="address_text"
                                rows={3}
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="Terisi otomatis dari titik peta, bisa diubah"
                                className="input resize-none"
                            />
                            <InputError message={errors.address} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="detail" value="Detail lainnya (opsional)" />
                            <TextInput
                                id="detail"
                                value={data.detail}
                                maxLength={255}
                                onChange={(e) => setData('detail', e.target.value)}
                                placeholder="No. rumah, blok, warna pagar, patokan…"
                            />
                            <InputError message={errors.detail} className="mt-2" />
                        </div>

                        {!address?.is_primary && !isFirst && (
                            <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-white p-3.5 text-sm ring-1 ring-forest-900/10">
                                <input
                                    type="checkbox"
                                    checked={data.is_primary}
                                    onChange={(e) => setData('is_primary', e.target.checked)}
                                    className="mt-0.5 h-4 w-4 rounded border-forest-900/20 text-forest-600 focus:ring-forest-500"
                                />
                                <span>
                                    <span className="block font-semibold text-forest-900">Jadikan alamat utama</span>
                                    <span className="text-xs text-forest-900/55">Otomatis dipakai sebagai lokasi saat memesan layanan.</span>
                                </span>
                            </label>
                        )}
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-forest-900/5 bg-white/60 px-6 py-4 sm:flex-row sm:justify-end md:px-7">
                    <button type="button" className="btn-ghost" onClick={onClose} disabled={processing}>
                        Batal
                    </button>
                    <button type="submit" className="btn-primary" disabled={processing}>
                        {processing ? 'Menyimpan…' : 'Simpan alamat'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
