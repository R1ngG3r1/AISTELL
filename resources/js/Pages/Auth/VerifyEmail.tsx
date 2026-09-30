import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { faEnvelopeOpenText } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout title="Verifikasi email Anda">
            <Head title="Verifikasi Email" />

            <div className="mx-auto grid h-16 w-16 animate-float place-items-center rounded-2xl bg-leaf-100 text-2xl text-forest-700">
                <FontAwesomeIcon icon={faEnvelopeOpenText} />
            </div>

            <p className="mt-5 text-center text-sm leading-relaxed text-forest-900/65">
                Terima kasih sudah mendaftar! Klik tautan yang kami kirim ke email Anda untuk memverifikasi akun.
                Belum menerima email? Kami bisa mengirim ulang.
            </p>

            {status === 'verification-link-sent' && (
                <div className="mt-5 rounded-2xl bg-leaf-100 p-3 text-center text-sm font-medium text-forest-700">
                    Tautan verifikasi baru sudah dikirim ke email Anda.
                </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-3">
                <PrimaryButton className="btn-lg w-full" disabled={processing}>
                    Kirim Ulang Email Verifikasi
                </PrimaryButton>
                <Link href={route('logout')} method="post" as="button" className="btn-ghost w-full">
                    Keluar
                </Link>
            </form>
        </GuestLayout>
    );
}
