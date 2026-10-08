import PageHeader from '@/Components/eco/PageHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate } from '@/lib/format';
import { Reveal } from '@/lib/motion';
import { Address, OrderStats, PageProps } from '@/types';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCalendarCheck, faCircleCheck, faClipboardList, faEnvelope, faHourglassHalf, faLocationDot, faPhone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head } from '@inertiajs/react';
import AddressBook from './Partials/AddressBook';
import AvatarUploader from './Partials/AvatarUploader';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

// Props dari ProfileController@edit
type Props = PageProps<{
    mustVerifyEmail: boolean;
    status?: string;
    summary: { memberSince: string | null; orders: OrderStats };
    addresses: Address[]; // buku alamat, alamat utama di urutan pertama (kosong untuk admin)
}>;

function Stat({ icon, label, value }: { icon: IconDefinition; label: string; value: number }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-2 py-3 text-center">
            <FontAwesomeIcon icon={icon} className="text-sm text-[#4de097]" />
            <p className="mt-1 text-lg font-extrabold leading-none tabular-nums">{value}</p>
            <p className="mt-1 text-[10.5px] font-semibold text-white/55">{label}</p>
        </div>
    );
}

export default function Edit({ auth, mustVerifyEmail, status, summary, addresses }: Props) {
    const user = auth.user;
    const isAdmin = user.role === 'admin';
    const active = summary.orders.menunggu + summary.orders.diproses;

    const primary = addresses.find((a) => a.is_primary);

    const contacts = [
        { icon: faEnvelope, value: user.email },
        { icon: faPhone, value: user.phone || 'Nomor telepon belum diisi' },
        // Admin tidak memesan layanan, jadi tidak punya buku alamat.
        ...(isAdmin ? [] : [{ icon: faLocationDot, value: primary?.address || 'Alamat utama belum diisi' }]),
    ];

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    eyebrow="Profil Saya"
                    title="Pengaturan akun"
                    description="Kelola foto profil, data diri, alamat, dan keamanan akun Anda."
                />
            }
        >
            <Head title="Profil Saya" />

            <div className="grid items-start gap-6 lg:grid-cols-[20rem_1fr]">
                {/* Kartu identitas */}
                <Reveal variant="left" className="lg:sticky lg:top-8">
                    <div className="relative isolate overflow-hidden rounded-[28px] bg-[#07271e] p-6 text-white shadow-lift">
                        <div
                            aria-hidden
                            className="absolute inset-0 -z-10 bg-[url('/landingpage/latardaun.jpeg')] bg-[length:360px_auto] opacity-40"
                        />
                        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-[#07271e]/70 via-[#07271e]/90 to-[#051d16]" />

                        <AvatarUploader user={user} />

                        <div className="mt-4 text-center">
                            <h1 className="font-display text-2xl font-bold leading-tight">{user.name}</h1>
                            <span className="mt-2 inline-flex rounded-full bg-[#4de097] px-3 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-[#07271e]">
                                {isAdmin ? 'Admin' : 'User'}
                            </span>
                            {!isAdmin && summary.memberSince && (
                                <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-white/60">
                                    <FontAwesomeIcon icon={faCalendarCheck} /> Bergabung sejak {formatDate(summary.memberSince)}
                                </p>
                            )}
                        </div>

                        <ul className="mt-5 space-y-2.5 border-t border-white/10 pt-5 text-[13px]">
                            {contacts.map((c, i) => (
                                <li key={i} className="flex gap-3 text-white/80">
                                    <FontAwesomeIcon icon={c.icon} className="mt-0.5 w-4 shrink-0 text-[#9fe0bf]" />
                                    <span className="min-w-0 break-words">{c.value}</span>
                                </li>
                            ))}
                        </ul>

                        <p className="mt-5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/45">
                            {isAdmin ? 'Seluruh pesanan' : 'Pesanan saya'}
                        </p>
                        <div className="mt-2 grid grid-cols-3 gap-2">
                            <Stat icon={faClipboardList} label="Total" value={summary.orders.total} />
                            <Stat icon={faHourglassHalf} label="Aktif" value={active} />
                            <Stat icon={faCircleCheck} label="Selesai" value={summary.orders.selesai} />
                        </div>
                    </div>
                </Reveal>

                <div className="space-y-6">
                    <Reveal className="card p-6 md:p-8">
                        <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} className="max-w-2xl" />
                    </Reveal>

                    {!isAdmin && (
                        <Reveal delay={40} className="card p-6 md:p-8">
                            <AddressBook addresses={addresses} />
                        </Reveal>
                    )}

                    <Reveal delay={80} className="card p-6 md:p-8">
                        <UpdatePasswordForm className="max-w-2xl" />
                    </Reveal>

                    {/* Akun admin tidak bisa dihapus (dicegah juga di ProfileController@destroy) */}
                    {!isAdmin && (
                        <Reveal delay={160} className="rounded-[22px] border border-clay-500/20 bg-clay-100/60 p-6 md:p-8">
                            <DeleteUserForm className="max-w-2xl" />
                        </Reveal>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
