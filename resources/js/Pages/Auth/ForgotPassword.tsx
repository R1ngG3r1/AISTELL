import TextInput from '@/Components/TextInput';
import GuestLayout, { authButton, authError, authInput, authLabel, authStatus } from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout
            title="Lupa Password?"
            subtitle={
                <>
                    Tidak masalah. Masukkan email Anda dan kami akan mengirim{' '}
                    <span className="font-medium italic text-[#2e7d5b] lg:text-[#38916d]">tautan reset password</span>.
                </>
            }
        >
            <Head title="Lupa Password - AISTEL" />

            {status && <div className={authStatus}>{status}</div>}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="email" className={`${authLabel} sm:sr-only`}>
                        Email
                    </label>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="email"
                        required
                        placeholder="Email address"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        className={authInput}
                    />
                    {errors.email && <p className={authError}>{errors.email}</p>}
                </div>

                <div className="pt-3">
                    <button type="submit" disabled={processing} className={authButton}>
                        {processing ? 'Mengirim...' : 'Kirim Tautan Reset'}
                    </button>
                </div>

                <div className="pt-6 text-center sm:pt-8">
                    <p className="text-xs text-[#18231f] sm:text-sm">
                        Ingat password?{' '}
                        <Link href={route('login')} className="font-extrabold text-[#113d29] hover:underline">
                            Kembali ke Login
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
