import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
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
            title="Lupa password?"
            subtitle="Tidak masalah. Masukkan email Anda dan kami akan mengirim tautan untuk membuat password baru."
        >
            <Head title="Lupa Password" />

            {status && <div className="mb-5 rounded-2xl bg-leaf-100 p-3 text-sm font-medium text-forest-700">{status}</div>}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        placeholder="nama@email.com"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <PrimaryButton className="btn-lg w-full" disabled={processing}>
                    Kirim Tautan Reset
                </PrimaryButton>
            </form>

            <p className="mt-6 text-center text-sm text-forest-900/60">
                Ingat password?{' '}
                <Link href={route('login')} className="font-semibold text-forest-600 hover:text-forest-800">
                    Kembali masuk
                </Link>
            </p>
        </GuestLayout>
    );
}
