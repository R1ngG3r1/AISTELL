import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { PageProps } from '@/types';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage<PageProps>().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        address: user.address ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'), { preserveScroll: true });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="display text-2xl">Informasi profil</h2>
                <p className="mt-1 text-sm text-forest-900/55">Perbarui nama, email, nomor telepon, dan alamat utama akun Anda.</p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-5">
                <div>
                    <InputLabel htmlFor="name" value="Nama" />
                    <TextInput id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required autoComplete="name" />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                        <InputError className="mt-2" message={errors.email} />
                    </div>
                    <div>
                        <InputLabel htmlFor="phone" value="Nomor telepon" />
                        <TextInput
                            id="phone"
                            type="tel"
                            value={data.phone}
                            placeholder="08xxxxxxxxxx"
                            onChange={(e) => setData('phone', e.target.value)}
                            autoComplete="tel"
                        />
                        <InputError className="mt-2" message={errors.phone} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="address" value="Alamat utama" />
                    <textarea
                        id="address"
                        rows={3}
                        value={data.address}
                        placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kota"
                        onChange={(e) => setData('address', e.target.value)}
                        autoComplete="street-address"
                        className="input"
                    />
                    <p className="mt-1.5 text-xs text-forest-900/50">Otomatis terisi sebagai lokasi layanan saat Anda memesan (tetap bisa diubah).</p>
                    <InputError className="mt-2" message={errors.address} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-2xl bg-sun-100 p-4 text-sm text-sun-600">
                        Email Anda belum terverifikasi.{' '}
                        <Link href={route('verification.send')} method="post" as="button" className="font-semibold underline">
                            Kirim ulang email verifikasi.
                        </Link>
                        {status === 'verification-link-sent' && (
                            <p className="mt-2 font-medium text-forest-700">Tautan verifikasi baru sudah dikirim ke email Anda.</p>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>{processing ? 'Menyimpan…' : 'Simpan'}</PrimaryButton>
                    {recentlySuccessful && (
                        <p className="animate-fade-up text-sm font-medium text-forest-600">
                            <FontAwesomeIcon icon={faCircleCheck} className="me-1.5" /> Tersimpan
                        </p>
                    )}
                </div>
            </form>
        </section>
    );
}
