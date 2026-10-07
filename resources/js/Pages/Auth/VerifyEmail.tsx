import GuestLayout, { authButton, authStatus } from '@/Layouts/GuestLayout';
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
        <GuestLayout
            title="Verifikasi Email"
            subtitle="Terima kasih sudah mendaftar! Klik tautan yang kami kirim ke email Anda untuk memverifikasi akun. Belum menerima email? Kami bisa mengirim ulang."
        >
            <Head title="Verifikasi Email - AISTEL" />

            <div className="mx-auto mb-6 grid h-16 w-16 animate-float place-items-center rounded-2xl border border-[#7ba794] bg-[#c5ddd1] text-2xl text-[#14432f] lg:mx-0">
                <FontAwesomeIcon icon={faEnvelopeOpenText} />
            </div>

            {status === 'verification-link-sent' && (
                <div className={authStatus}>Tautan verifikasi baru sudah dikirim ke email Anda.</div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <button type="submit" disabled={processing} className={authButton}>
                    {processing ? 'Mengirim...' : 'Kirim Ulang Email Verifikasi'}
                </button>

                <div className="pt-4 text-center">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-xs font-extrabold text-[#113d29] hover:underline sm:text-sm"
                    >
                        Keluar
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
