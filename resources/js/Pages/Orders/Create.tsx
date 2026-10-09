import { Leaf } from '@/Components/eco/Illustrations';
import { LocationPicker } from '@/Components/eco/map';
import TimeWheel, { Zone } from '@/Components/eco/TimeWheel';
import PageHeader from '@/Components/eco/PageHeader';
import ServiceIcon from '@/Components/eco/ServiceIcon';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate, formatRupiah } from '@/lib/format';
import { Reveal } from '@/lib/motion';
import { toLatLng } from '@/lib/geo';
import { Address, PageProps, Service } from '@/types';
import { faArrowRight, faCalendarDays, faCheck, faClock, faLocationDot, faMapPin, faPlus, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, ReactNode, useState } from 'react';

// Props dari OrderController@create
type Props = PageProps<{ services: Service[]; selectedServiceId: number | null; addresses: Address[] }>;

/** Teks lokasi pesanan dari alamat tersimpan: alamat lengkap + detail (no. rumah/patokan). */
const locationText = (a: Address) => (a.detail ? `${a.address}\n${a.detail}` : a.address);

// Selisih jam terhadap WIB (zona waktu server).
const ZONE_OFFSET: Record<Zone, number> = { WIB: 0, WITA: 1, WIT: 2 };

function Step({ n, title, children, delay = 0 }: { n: number; title: string; children: ReactNode; delay?: number }) {
    return (
        <Reveal delay={delay} className="card p-6 md:p-7">
            <div className="mb-5 flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-forest-900 font-display text-sm font-bold text-leaf-400">{n}</span>
                <h2 className="text-lg font-bold">{title}</h2>
            </div>
            {children}
        </Reveal>
    );
}

export default function OrderCreate({ auth, services, selectedServiceId, addresses }: Props) {
    // Alamat utama selalu di urutan pertama (AddressService::listFor) → terpilih otomatis.
    const primary = addresses.find((a) => a.is_primary) ?? null;
    // Alamat tersimpan yang sedang dipakai; null = lokasi lain (dipilih manual di peta).
    const [addressId, setAddressId] = useState<number | null>(primary?.id ?? null);

    // useForm Inertia: menyimpan isi form + error validasi dari backend (StoreOrderRequest).
    // Nama, telepon, dan alamat diisi otomatis dari akun, tapi boleh diubah.
    const { data, setData, post, processing, errors, transform } = useForm({
        service_id: selectedServiceId ? String(selectedServiceId) : '',
        contact_name: auth.user.name,
        contact_phone: auth.user.phone ?? '',
        location: primary ? locationText(primary) : '', // diisi dari alamat utama di Profil Saya
        latitude: primary?.latitude ?? (null as number | null),
        longitude: primary?.longitude ?? (null as number | null),
        date: '',
        time: '',
        notes: '',
    });

    // Waktu diinput dalam zona Indonesia pilihan pengguna, lalu dikonversi ke WIB (zona server) saat dikirim.
    const [zone, setZone] = useState<Zone>('WIB');

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        transform((d) => {
            if (!d.date || !d.time || ZONE_OFFSET[zone] === 0) return d;
            const wib = new Date(`${d.date}T${d.time}:00Z`);
            wib.setUTCHours(wib.getUTCHours() - ZONE_OFFSET[zone]);
            const iso = wib.toISOString();
            return { ...d, date: iso.slice(0, 10), time: iso.slice(11, 16) };
        });
        post(route('orders.store')); // → POST /orders
    };

    // Format YYYY-MM-DD sesuai zona waktu lokal (en-CA kebetulan memakai format itu).
    const today = new Date().toLocaleDateString('en-CA');
    const selected = services.find((s) => String(s.id) === data.service_id);
    // Layanan terkunci bila datang dari halaman layanan (?service=ID yang valid).
    const [serviceLocked] = useState(() => services.some((s) => s.id === selectedServiceId));
    const offset = serviceLocked ? 0 : 1;
    const point = toLatLng(data);

    const chooseAddress = (a: Address | null) => {
        setAddressId(a?.id ?? null);
        setData((d) => ({
            ...d,
            location: a ? locationText(a) : '',
            latitude: a?.latitude ?? null,
            longitude: a?.longitude ?? null,
        }));
    };

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    eyebrow="Pesan Layanan"
                    title="Formulir pemesanan"
                    description="Lengkapi detail di bawah. Admin akan mengonfirmasi pesanan Anda secepatnya."
                />
            }
        >
            <Head title="Pesan Layanan" />

            <form onSubmit={submit} className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="space-y-5">
                    {/* Layanan sudah dipilih dari halaman sebelumnya → langkah ini disembunyikan agar tidak memilih dua kali. */}
                    {!serviceLocked && (
                    <Step n={1} title="Pilih layanan">
                        <div className="grid gap-3 sm:grid-cols-2">
                            {services.map((s) => {
                                const active = data.service_id === String(s.id);
                                return (
                                    <button
                                        type="button"
                                        key={s.id}
                                        onClick={() => setData('service_id', String(s.id))}
                                        className={`relative flex items-center gap-3 rounded-2xl p-3.5 text-left ring-1 transition duration-300 ${
                                            active
                                                ? 'bg-forest-900 text-cream shadow-lift ring-forest-900'
                                                : 'bg-white ring-forest-900/10 hover:-translate-y-0.5 hover:ring-forest-500/40'
                                        }`}
                                    >
                                        <span
                                            className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition ${
                                                active ? 'bg-leaf-400 text-forest-900' : 'bg-forest-50 text-forest-600'
                                            }`}
                                        >
                                            <ServiceIcon name={s.name} />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-bold">{s.name}</span>
                                            <span className={`text-xs ${active ? 'text-cream/60' : 'text-forest-900/50'}`}>
                                                {formatRupiah(s.price)}
                                            </span>
                                        </span>
                                        {active && (
                                            <span className="grid h-6 w-6 animate-scale-in place-items-center rounded-full bg-leaf-400 text-[10px] text-forest-900">
                                                <FontAwesomeIcon icon={faCheck} />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        <InputError message={errors.service_id} className="mt-3" />
                    </Step>
                    )}

                    <Step n={1 + offset} title="Data pemesan" delay={80}>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="contact_name" value="Nama pemesan" />
                                <TextInput id="contact_name" value={data.contact_name} onChange={(e) => setData('contact_name', e.target.value)} />
                                <InputError message={errors.contact_name} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="contact_phone" value="Nomor kontak" />
                                <TextInput
                                    id="contact_phone"
                                    type="tel"
                                    placeholder="08xxxxxxxxxx"
                                    value={data.contact_phone}
                                    onChange={(e) => setData('contact_phone', e.target.value)}
                                />
                                <InputError message={errors.contact_phone} className="mt-2" />
                            </div>
                        </div>
                    </Step>

                    <Step n={2 + offset} title="Lokasi & jadwal" delay={160}>
                        <div className="space-y-4">
                            <div>
                                <InputLabel value="Pilih alamat" />
                                {addresses.length > 0 ? (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {addresses.map((a) => {
                                            const active = addressId === a.id;
                                            return (
                                                <button
                                                    type="button"
                                                    key={a.id}
                                                    onClick={() => chooseAddress(a)}
                                                    className={`flex gap-3 rounded-2xl p-3.5 text-left ring-1 transition duration-300 ${
                                                        active ? 'bg-forest-50 ring-2 ring-forest-500' : 'bg-white ring-forest-900/10 hover:ring-forest-500/40'
                                                    }`}
                                                >
                                                    <FontAwesomeIcon icon={faLocationDot} className={`mt-0.5 ${active ? 'text-forest-600' : 'text-forest-900/30'}`} />
                                                    <span className="min-w-0 flex-1">
                                                        <span className="flex items-center gap-2">
                                                            <span className="truncate text-sm font-bold">{a.label}</span>
                                                            {a.is_primary && (
                                                                <span className="rounded-full bg-forest-900 px-2 py-px text-[10px] font-bold uppercase tracking-wider text-leaf-400">
                                                                    Utama
                                                                </span>
                                                            )}
                                                        </span>
                                                        <span className="mt-0.5 line-clamp-2 text-xs text-forest-900/55">{a.address}</span>
                                                    </span>
                                                    {active && <FontAwesomeIcon icon={faCheck} className="mt-0.5 text-forest-600" />}
                                                </button>
                                            );
                                        })}
                                        <button
                                            type="button"
                                            onClick={() => chooseAddress(null)}
                                            className={`flex items-center gap-3 rounded-2xl border-2 border-dashed p-3.5 text-left text-sm font-semibold transition ${
                                                addressId === null
                                                    ? 'border-forest-500 bg-forest-50 text-forest-700'
                                                    : 'border-forest-900/15 text-forest-900/60 hover:border-forest-500/50'
                                            }`}
                                        >
                                            <FontAwesomeIcon icon={faMapPin} /> Lokasi lain (pilih di peta)
                                        </button>
                                    </div>
                                ) : (
                                    <p className="rounded-2xl bg-forest-50 p-4 text-sm text-forest-700">
                                        Belum ada alamat tersimpan. Pilih lokasi di peta di bawah, atau{' '}
                                        <Link href={route('profile.edit')} className="font-semibold underline">
                                            simpan alamat di Profil Saya
                                        </Link>{' '}
                                        agar otomatis terisi di pesanan berikutnya.
                                    </p>
                                )}
                                {addresses.length > 0 && (
                                    <Link href={route('profile.edit')} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-forest-600 hover:underline">
                                        <FontAwesomeIcon icon={faPlus} /> Kelola alamat di Profil Saya
                                    </Link>
                                )}
                            </div>

                            <div>
                                <InputLabel value="Titik lokasi di peta" />
                                <LocationPicker
                                    value={point}
                                    onChange={(p) => {
                                        // Titik digeser → bukan lagi alamat tersimpan apa adanya.
                                        setAddressId(null);
                                        setData((d) => ({ ...d, latitude: p.lat, longitude: p.lng }));
                                    }}
                                    onAddress={(text) => setData('location', text)}
                                />
                                <InputError message={errors.latitude || errors.longitude} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="location" value="Alamat lokasi layanan" />
                                <textarea
                                    id="location"
                                    rows={3}
                                    placeholder="Terisi otomatis dari alamat / titik peta. Lengkapi nomor rumah, RT/RW, atau patokan bila perlu"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    className="input"
                                />
                                <InputError message={errors.location} className="mt-2" />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="date" value="Tanggal" />
                                    <TextInput id="date" type="date" min={today} value={data.date} onChange={(e) => setData('date', e.target.value)} />
                                    <InputError message={errors.date} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="time" value="Waktu" />
                                    <TimeWheel id="time" value={data.time} zone={zone} onChange={(t) => setData('time', t)} onZoneChange={setZone} />
                                    <InputError message={errors.time} className="mt-2" />
                                </div>
                            </div>
                        </div>
                    </Step>

                    <Step n={3 + offset} title="Catatan tambahan" delay={240}>
                        <textarea
                            id="notes"
                            rows={3}
                            placeholder="Opsional, mis. patokan rumah, area yang perlu perhatian khusus…"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="input"
                        />
                        <InputError message={errors.notes} className="mt-2" />
                    </Step>
                </div>

                {/* Ringkasan (menempel saat scroll di layar besar) */}
                <aside className="lg:sticky lg:top-8">
                    <Reveal variant="right" className="relative overflow-hidden rounded-4xl bg-forest-900 p-6 text-cream shadow-lift">
                        <Leaf className="absolute -right-10 -top-10 h-40 w-40 rotate-12 text-forest-800" />
                        <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-leaf-400">Ringkasan</p>

                        {selected ? (
                            <div key={selected.id} className="relative mt-4 flex animate-fade-up items-center gap-3">
                                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-leaf-400 text-forest-900">
                                    <ServiceIcon name={selected.name} />
                                </span>
                                <div>
                                    <p className="font-bold">{selected.name}</p>
                                    <p className="text-sm text-cream/60">{formatRupiah(selected.price)}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="relative mt-4 text-sm text-cream/60">Belum ada layanan dipilih.</p>
                        )}

                        <dl className="relative mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
                            {[
                                { icon: faUser, value: data.contact_name || '—' },
                                { icon: faLocationDot, value: data.location || '—' },
                                { icon: faCalendarDays, value: data.date ? formatDate(data.date) : '—' },
                                { icon: faClock, value: data.time ? `${data.time} ${zone}` : '—' },
                            ].map((row, i) => (
                                <div key={i} className="flex gap-3">
                                    <FontAwesomeIcon icon={row.icon} className="mt-0.5 w-4 text-leaf-400" />
                                    <dd className="line-clamp-2 text-cream/80">{row.value}</dd>
                                </div>
                            ))}
                        </dl>

                        <div className="relative mt-6 flex items-baseline justify-between border-t border-white/10 pt-5">
                            <span className="text-sm text-cream/60">Estimasi biaya</span>
                            <span className="display text-3xl">{selected ? formatRupiah(selected.price) : '—'}</span>
                        </div>

                        <button type="submit" disabled={processing} className="btn-leaf btn-lg group relative mt-6 w-full">
                            {processing ? 'Mengirim…' : 'Lanjut ke Pembayaran'}
                            <FontAwesomeIcon icon={faArrowRight} className="transition-transform group-hover:translate-x-1" />
                        </button>
                        <p className="relative mt-3 text-center text-xs text-cream/50">Status pesanan bisa dipantau di menu Pesanan Saya.</p>
                    </Reveal>
                </aside>
            </form>
        </AuthenticatedLayout>
    );
}
