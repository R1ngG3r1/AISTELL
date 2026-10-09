import { MethodLogo, PaymentBadge } from '@/Components/eco/Payment';
import PageHeader from '@/Components/eco/PageHeader';
import ServiceIcon from '@/Components/eco/ServiceIcon';
import InputError from '@/Components/InputError';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate, formatRupiah, formatTime, orderPrice } from '@/lib/format';
import { Reveal } from '@/lib/motion';
import { GROUP_LABELS, GROUP_ORDER, groupDigits, paymentSteps } from '@/lib/payment';
import { Order, PageProps, Payment, PaymentMethodOption } from '@/types';
import {
    faArrowLeft,
    faArrowRight,
    faCheck,
    faChevronDown,
    faCircleCheck,
    faCircleInfo,
    faClock,
    faCopy,
    faSpinner,
    faDownload,
    faHandHoldingDollar,
    faRotateLeft,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link, router, useForm } from '@inertiajs/react';
import QRCode from 'qrcode';
import { FormEventHandler, useEffect, useState } from 'react';

// Props dari PaymentController@show
type Props = PageProps<{ order: Order; payment: Payment | null; methods: PaymentMethodOption[] }>;

export default function PaymentShow({ order, payment, methods }: Props) {
    // true = user menekan "Ganti metode" saat masih ada tagihan menunggu
    const [choosing, setChoosing] = useState(false);
    const orderActive = order.status === 'menunggu' || order.status === 'diproses';

    let content;
    if (payment?.status === 'lunas') {
        content = <PaidCard order={order} payment={payment} />;
    } else if (payment?.status === 'dikembalikan') {
        content = (
            <Notice icon={faRotateLeft} title="Dana dikembalikan">
                Pesanan ini {order.status_label.toLowerCase()}, sehingga pembayaran {formatRupiah(payment.amount)} dikembalikan ke metode
                pembayaran asal dalam 1–3 hari kerja.
            </Notice>
        );
    } else if (!orderActive) {
        content = (
            <Notice icon={faCircleInfo} title="Pembayaran tidak tersedia">
                Pesanan ini berstatus {order.status_label}, sehingga tidak perlu dibayar.
            </Notice>
        );
    } else if (payment?.status === 'menunggu' && !choosing) {
        content = <Instructions order={order} payment={payment} onChangeMethod={() => setChoosing(true)} />;
    } else {
        content = (
            <MethodChooser
                order={order}
                methods={methods}
                expired={payment?.status === 'kedaluwarsa'}
                onCancel={payment?.status === 'menunggu' ? () => setChoosing(false) : undefined}
                onDone={() => setChoosing(false)}
            />
        );
    }

    return (
        <AuthenticatedLayout
            live={['order', 'payment']}
            header={
                <PageHeader
                    eyebrow="Pembayaran"
                    title={`Pesanan #${order.id}`}
                    description="Pilih metode pembayaran yang Anda inginkan."
                />
            }
        >
            <Head title={`Pembayaran #${order.id}`} />

            <Link href={route('orders.show', order.id)} className="btn-ghost btn-sm mb-6">
                <FontAwesomeIcon icon={faArrowLeft} /> Detail pesanan
            </Link>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <div>{content}</div>
                <Summary order={order} payment={payment} />
            </div>
        </AuthenticatedLayout>
    );
}

/* -------------------------------------------------------------------------- */
/*  Pilih metode                                                              */
/* -------------------------------------------------------------------------- */

function MethodChooser({
    order,
    methods,
    expired,
    onCancel,
    onDone,
}: {
    order: Order;
    methods: PaymentMethodOption[];
    expired: boolean;
    onCancel?: () => void;
    onDone: () => void;
}) {
    const { data, setData, post, processing, errors } = useForm({ method: '' });
    // Grup yang terbuka (akordeon). QRIS terbuka sejak awal.
    const [open, setOpen] = useState<string>('qris');
    const selected = methods.find((m) => m.value === data.method);
    const total = Number(orderPrice(order) ?? 0) + (selected?.fee ?? 0);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('orders.payment.store', order.id), { preserveScroll: true, onSuccess: onDone });
    };

    return (
        <Reveal className="card p-6 md:p-7">
            <form onSubmit={submit}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="display text-2xl">Pilih metode pembayaran</h2>
                    {onCancel && (
                        <button type="button" onClick={onCancel} className="btn-ghost btn-sm">
                            Batal ganti metode
                        </button>
                    )}
                </div>

                {expired && (
                    <p className="mt-4 flex items-start gap-3 rounded-2xl bg-sun-100 p-4 text-sm text-sun-600">
                        <FontAwesomeIcon icon={faClock} className="mt-0.5" />
                        Batas waktu tagihan sebelumnya sudah habis. Silakan pilih metode pembayaran lagi.
                    </p>
                )}

                <div className="mt-5 space-y-3">
                    {GROUP_ORDER.map((group) => {
                        const items = methods.filter((m) => m.group === group);
                        const isOpen = open === group || items.some((m) => m.value === data.method);
                        const g = GROUP_LABELS[group];
                        return (
                            <div key={group} className={`overflow-hidden rounded-2xl bg-white ring-1 transition ${isOpen ? 'ring-forest-500/40' : 'ring-forest-900/10'}`}>
                                <button
                                    type="button"
                                    onClick={() => setOpen(isOpen && open === group ? '' : group)}
                                    className="flex w-full items-center gap-4 px-4 py-3.5 text-left"
                                    aria-expanded={isOpen}
                                >
                                    <div className="flex -space-x-2">
                                        {items.slice(0, 3).map((m) => (
                                            <MethodLogo key={m.value} method={m.value} className="h-8 w-11 text-[9.5px] ring-2 ring-white" />
                                        ))}
                                    </div>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-bold text-forest-900">{g.title}</span>
                                        <span className="block truncate text-xs text-forest-900/50">{g.hint}</span>
                                    </span>
                                    <FontAwesomeIcon icon={faChevronDown} className={`text-xs text-forest-900/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isOpen && (
                                    <div className="grid gap-2 border-t border-forest-900/5 p-3 sm:grid-cols-2">
                                        {items.map((m) => {
                                            const active = data.method === m.value;
                                            return (
                                                <label
                                                    key={m.value}
                                                    className={`flex cursor-pointer items-center gap-3 rounded-xl p-3 ring-1 transition ${
                                                        active ? 'bg-forest-50 ring-2 ring-forest-500' : 'ring-forest-900/10 hover:bg-cream'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="method"
                                                        value={m.value}
                                                        checked={active}
                                                        onChange={() => setData('method', m.value)}
                                                        className="sr-only"
                                                    />
                                                    <MethodLogo method={m.value} />
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block truncate text-sm font-semibold text-forest-900">{m.label}</span>
                                                        <span className="text-xs text-forest-900/50">{m.fee ? `Biaya ${formatRupiah(m.fee)}` : 'Tanpa biaya'}</span>
                                                    </span>
                                                    <span
                                                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[9px] ring-1 ${
                                                            active ? 'bg-forest-600 text-white ring-forest-600' : 'ring-forest-900/20'
                                                        }`}
                                                    >
                                                        {active && <FontAwesomeIcon icon={faCheck} />}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <InputError message={errors.method} className="mt-3" />

                <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-forest-900 p-5 text-cream sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs text-cream/60">Total pembayaran</p>
                        <p className="display text-2xl">{formatRupiah(total)}</p>
                        <p className="text-xs text-cream/60">{selected ? selected.label : 'Belum memilih metode'}</p>
                    </div>
                    <button type="submit" disabled={!data.method || processing} className="btn-leaf btn-lg group">
                        {processing ? 'Memproses…' : selected?.group === 'cod' ? 'Pilih Bayar di Tempat' : 'Bayar Sekarang'}
                        <FontAwesomeIcon icon={faArrowRight} className="transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </form>
        </Reveal>
    );
}

/* -------------------------------------------------------------------------- */
/*  Alur proses pembayaran (terstruktur)                                      */
/* -------------------------------------------------------------------------- */

const PROCESSING_MS = 3000;

const PROGRESS_STEPS = [
    { title: 'Metode dipilih', hint: 'Metode pembayaran Anda tersimpan' },
    { title: 'Kode pembayaran dibuat', hint: 'QR / nomor VA / kode bayar siap dipakai' },
    { title: 'Memproses pembayaran', hint: 'Menunggu konfirmasi pembayaran' },
    { title: 'Pembayaran berhasil', hint: 'Status pesanan menjadi Sudah Terbayar' },
];

/** stage 'processing' = langkah 3 berjalan (animasi memuat); 'done' = semua langkah selesai. */
function PaymentProgress({ stage, className = '' }: { stage: 'processing' | 'done'; className?: string }) {
    const current = stage === 'done' ? PROGRESS_STEPS.length : 2; // indeks langkah yang sedang berjalan
    return (
        <Reveal className={`card p-5 md:p-6 ${className}`}>
            <ol className="grid gap-4 sm:grid-cols-4 sm:gap-3">
                {PROGRESS_STEPS.map((step, i) => {
                    const done = i < current;
                    const active = i === current;
                    return (
                        <li key={step.title} className="flex gap-3 sm:flex-col sm:gap-2">
                            <div className="flex items-center sm:w-full">
                                <span
                                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm transition-colors duration-500 ${
                                        done ? 'bg-forest-600 text-white' : active ? 'bg-leaf-400 text-forest-900' : 'bg-forest-50 text-forest-900/40'
                                    }`}
                                >
                                    {done ? <FontAwesomeIcon icon={faCheck} /> : active ? <FontAwesomeIcon icon={faSpinner} spin /> : i + 1}
                                </span>
                                {i < PROGRESS_STEPS.length - 1 && (
                                    <span className="relative ml-2 hidden h-1 flex-1 overflow-hidden rounded-full bg-forest-50 sm:block">
                                        <span
                                            className={`absolute inset-y-0 left-0 rounded-full bg-forest-600 ${
                                                done ? 'w-full' : active ? 'animate-progress-fill' : 'w-0'
                                            }`}
                                            style={active ? { animationDuration: `${PROCESSING_MS}ms` } : undefined}
                                        />
                                    </span>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className={`text-sm font-bold ${done || active ? 'text-forest-900' : 'text-forest-900/40'}`}>{step.title}</p>
                                <p className="text-xs text-forest-900/50">{active ? 'Mohon tunggu sebentar…' : step.hint}</p>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </Reveal>
    );
}

/* -------------------------------------------------------------------------- */
/*  Instruksi pembayaran (tagihan menunggu)                                   */
/* -------------------------------------------------------------------------- */

function Instructions({ order, payment, onChangeMethod }: { order: Order; payment: Payment; onChangeMethod: () => void }) {
    const steps = paymentSteps(payment);
    const channels = Object.keys(steps);
    const [channel, setChannel] = useState(channels[0]);
    const isCod = payment.method_group === 'cod';

    // DUMMY: tanpa payment gateway, pembayaran non-tunai "masuk" otomatis setelah jeda singkat.
    useEffect(() => {
        if (isCod) return;
        const t = window.setTimeout(() => {
            router.post(route('orders.payment.confirm', order.id), {}, { preserveScroll: true });
        }, PROCESSING_MS);
        return () => window.clearTimeout(t);
    }, [isCod, order.id, payment.id]);

    return (
        <div className="space-y-5">
            {!isCod && <PaymentProgress stage="processing" />}
            <Reveal className="card overflow-hidden">
                <div className="p-6 md:p-7">
                    <div className="flex items-center gap-3">
                        <MethodLogo method={payment.method} className="h-11 w-16 text-xs" />
                        <div className="min-w-0">
                            <p className="font-bold text-forest-900">{payment.method_label}</p>
                            <p className="text-xs text-forest-900/50">No. transaksi {payment.reference}</p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <CopyField label="Total tagihan" value={String(Math.round(Number(payment.amount)))} display={formatRupiah(payment.amount)} />
                        {payment.method_group === 'va' && payment.code && (
                            <CopyField label="Nomor Virtual Account" value={payment.code} display={groupDigits(payment.code)} />
                        )}
                        {payment.method_group === 'retail' && payment.code && (
                            <CopyField label="Kode pembayaran" value={payment.code} display={payment.code} />
                        )}
                    </div>

                    {(payment.method_group === 'qris' || payment.method_group === 'ewallet') && payment.code && (
                        <QrBlock payload={payment.code} reference={payment.reference} methodLabel={payment.method_label} />
                    )}

                    {isCod && (
                        <p className="mt-6 flex items-start gap-3 rounded-2xl bg-forest-50 p-4 text-sm text-forest-700">
                            <FontAwesomeIcon icon={faHandHoldingDollar} className="mt-0.5" />
                            Siapkan uang tunai {formatRupiah(payment.amount)} (sebaiknya uang pas). Bayar ke petugas setelah layanan selesai.
                        </p>
                    )}

                    {/* Langkah pembayaran per channel */}
                    <div className="mt-7">
                        {channels.length > 1 && (
                            <div className="mb-4 flex flex-wrap gap-2">
                                {channels.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setChannel(c)}
                                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 transition ${
                                            channel === c ? 'bg-forest-900 text-cream ring-forest-900' : 'bg-white text-forest-900/70 ring-forest-900/15'
                                        }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        )}
                        <p className="text-sm font-bold text-forest-900">{channels.length > 1 ? `Bayar lewat ${channel}` : channel}</p>
                        <ol className="mt-3 space-y-2.5">
                            {steps[channel].map((s, i) => (
                                <li key={i} className="flex gap-3 text-sm text-forest-900/75">
                                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-forest-50 text-xs font-bold text-forest-600">{i + 1}</span>
                                    {s}
                                </li>
                            ))}
                        </ol>
                    </div>

                    {isCod && (
                        <div className="mt-7 flex flex-wrap gap-2 border-t border-forest-900/5 pt-5">
                            <button type="button" onClick={onChangeMethod} className="btn-ghost btn-sm">
                                Ganti metode pembayaran
                            </button>
                        </div>
                    )}
                </div>
            </Reveal>

        </div>
    );
}

function QrBlock({ payload, reference, methodLabel }: { payload: string; reference: string; methodLabel: string }) {
    const [src, setSrc] = useState<string | null>(null);

    useEffect(() => {
        QRCode.toDataURL(payload, { width: 560, margin: 1, errorCorrectionLevel: 'M', color: { dark: '#072d23', light: '#ffffff' } }).then(setSrc);
    }, [payload]);

    return (
        <div className="mt-6 flex flex-col items-center rounded-2xl bg-white p-6 ring-1 ring-forest-900/10">
            <p className="font-display text-sm font-extrabold tracking-wide text-forest-900">
                <span className="text-[#d6202f]">QRIS</span> · AISTEL
            </p>
            <p className="text-[11px] text-forest-900/45">NMID: ID{reference.replace(/\D/g, '').padEnd(13, '0').slice(0, 13)}</p>
            <div className="mt-4 grid h-60 w-60 place-items-center rounded-2xl bg-white p-2 ring-1 ring-forest-900/10">
                {src ? <img src={src} alt={`Kode QR pembayaran ${methodLabel}`} className="h-full w-full" /> : <div className="h-full w-full animate-pulse rounded-xl bg-forest-50" />}
            </div>
            <p className="mt-3 text-center text-xs text-forest-900/50">Scan dengan aplikasi {methodLabel === 'QRIS' ? 'bank / e-wallet' : methodLabel} Anda</p>
            {src && (
                <a href={src} download={`QR-${reference}.png`} className="btn-ghost btn-sm mt-3">
                    <FontAwesomeIcon icon={faDownload} /> Unduh QR
                </a>
            )}
        </div>
    );
}

function CopyField({ label, value, display }: { label: string; value: string; display: string }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
        } catch {
            /* clipboard tidak diizinkan (mis. bukan HTTPS) → abaikan */
        }
    };
    return (
        <div className="rounded-2xl bg-white p-4 ring-1 ring-forest-900/10">
            <p className="text-xs font-semibold uppercase tracking-wider text-forest-900/40">{label}</p>
            <div className="mt-1 flex items-center justify-between gap-3">
                <p className="break-all font-display text-xl font-bold tabular-nums text-forest-900">{display}</p>
                <button type="button" onClick={copy} className="btn btn-sm shrink-0 bg-forest-50 text-forest-700 hover:bg-forest-100">
                    <FontAwesomeIcon icon={copied ? faCheck : faCopy} /> {copied ? 'Tersalin' : 'Salin'}
                </button>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Lunas / info                                                              */
/* -------------------------------------------------------------------------- */

function PaidCard({ order, payment }: { order: Order; payment: Payment }) {
    const rows = [
        { label: 'No. transaksi', value: payment.reference },
        { label: 'Metode', value: payment.method_label },
        { label: 'Waktu bayar', value: payment.paid_at ? new Date(payment.paid_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) : '—' },
        { label: 'Total dibayar', value: formatRupiah(payment.amount) },
    ];
    return (
        <Reveal className="card p-6 text-center md:p-10">
            {payment.method_group !== 'cod' && <PaymentProgress stage="done" className="mb-8 text-left" />}
            <span className="mx-auto grid h-20 w-20 animate-scale-in place-items-center rounded-full bg-leaf-100 text-4xl text-forest-600">
                <FontAwesomeIcon icon={faCircleCheck} />
            </span>
            <h2 className="display mt-5 text-3xl">Pembayaran berhasil</h2>
            <p className="mt-2 text-sm text-forest-900/60">Terima kasih! Admin akan segera mengonfirmasi jadwal layanan Anda.</p>
            <dl className="mx-auto mt-7 max-w-md divide-y divide-forest-900/5 rounded-2xl bg-white text-left text-sm ring-1 ring-forest-900/10">
                {rows.map((r) => (
                    <div key={r.label} className="flex justify-between gap-4 px-4 py-3">
                        <dt className="text-forest-900/50">{r.label}</dt>
                        <dd className="text-right font-semibold text-forest-900">{r.value}</dd>
                    </div>
                ))}
            </dl>
            <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
                <Link href={route('orders.show', order.id)} className="btn-primary">
                    Lihat detail pesanan
                </Link>
                <Link href={route('orders.index')} className="btn-ghost">
                    Pesanan saya
                </Link>
            </div>
        </Reveal>
    );
}

function Notice({ icon, title, children }: { icon: typeof faCircleInfo; title: string; children: React.ReactNode }) {
    return (
        <Reveal className="card flex items-start gap-4 p-6 md:p-7">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-forest-50 text-lg text-forest-600">
                <FontAwesomeIcon icon={icon} />
            </span>
            <div>
                <h2 className="display text-2xl">{title}</h2>
                <p className="mt-1 text-sm text-forest-900/60">{children}</p>
            </div>
        </Reveal>
    );
}

/* -------------------------------------------------------------------------- */
/*  Ringkasan (sidebar)                                                       */
/* -------------------------------------------------------------------------- */

function Summary({ order, payment }: { order: Order; payment: Payment | null }) {
    const price = Number(orderPrice(order) ?? 0);
    // Biaya layanan hanya ditampilkan dari tagihan yang masih berlaku.
    const fee = payment && ['menunggu', 'lunas', 'dikembalikan'].includes(payment.status) ? Number(payment.fee) : 0;

    return (
        <aside className="lg:sticky lg:top-8">
            <Reveal variant="right" className="card p-6">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest-900/40">Ringkasan</p>
                    <PaymentBadge payment={payment && payment.status !== 'dibatalkan' ? payment : null} />
                </div>
                <div className="mt-4 flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-forest-900 text-leaf-400">
                        <ServiceIcon name={order.service?.name ?? ''} />
                    </span>
                    <div className="min-w-0">
                        <p className="truncate font-bold">{order.service?.name}</p>
                        <p className="text-xs text-forest-900/50">
                            {formatDate(order.date)} · {formatTime(order.time)} WIB
                        </p>
                    </div>
                </div>
                <p className="mt-3 line-clamp-2 text-xs text-forest-900/55">{order.location}</p>

                <dl className="mt-5 space-y-2 border-t border-forest-900/5 pt-4 text-sm">
                    <div className="flex justify-between">
                        <dt className="text-forest-900/55">Harga layanan</dt>
                        <dd>{formatRupiah(price)}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-forest-900/55">Biaya layanan</dt>
                        <dd>{fee ? formatRupiah(fee) : 'Rp0'}</dd>
                    </div>
                    <div className="flex items-baseline justify-between border-t border-forest-900/5 pt-3">
                        <dt className="font-semibold">Total</dt>
                        <dd className="display text-2xl">{formatRupiah(price + fee)}</dd>
                    </div>
                </dl>

            </Reveal>
        </aside>
    );
}
