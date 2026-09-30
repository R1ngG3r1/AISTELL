import Checkbox from '@/Components/Checkbox';
import PasswordInput from '@/Components/eco/PasswordInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout title="Selamat datang kembali" subtitle="Masuk untuk memesan dan memantau layanan kebersihan Anda.">
            <Head title="Masuk" />

            {status && <div className="mb-5 rounded-2xl bg-leaf-100 p-3 text-sm font-medium text-forest-700">{status}</div>}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="username"
                        placeholder="nama@email.com"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="password" value="Password" />
                        {canResetPassword && (
                            <Link href={route('password.request')} className="mb-1.5 text-xs font-semibold text-forest-500 hover:text-forest-700">
                                Lupa password?
                            </Link>
                        )}
                    </div>
                    <PasswordInput
                        id="password"
                        name="password"
                        value={data.password}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <label className="flex items-center gap-2.5">
                    <Checkbox
                        name="remember"
                        checked={data.remember}
                        onChange={(e) => setData('remember', (e.target.checked || false) as false)}
                    />
                    <span className="text-sm text-forest-900/70">Ingat saya</span>
                </label>

                <PrimaryButton className="btn-lg group w-full" disabled={processing}>
                    {processing ? 'Memproses…' : 'Masuk'}
                    <FontAwesomeIcon icon={faArrowRight} className="transition-transform group-hover:translate-x-1" />
                </PrimaryButton>
            </form>

            <p className="mt-6 text-center text-sm text-forest-900/60">
                Belum punya akun?{' '}
                <Link href={route('register')} className="font-semibold text-forest-600 hover:text-forest-800">
                    Daftar sekarang
                </Link>
            </p>
        </GuestLayout>
    );
}
