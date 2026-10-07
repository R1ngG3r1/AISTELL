import PasswordInput from '@/Components/eco/PasswordInput';
import TextInput from '@/Components/TextInput';
import GuestLayout, { authButton, authError, authInput, authLabel } from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ResetPassword({ token, email }: { token: string; email: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout title="Buat Password Baru" subtitle="Gunakan password yang kuat dan belum pernah Anda pakai.">
            <Head title="Reset Password - AISTEL" />

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="email" className={authLabel}>
                        Email
                    </label>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        className={authInput}
                    />
                    {errors.email && <p className={authError}>{errors.email}</p>}
                </div>

                <div>
                    <label htmlFor="password" className={authLabel}>
                        Password baru
                    </label>
                    <PasswordInput
                        id="password"
                        name="password"
                        value={data.password}
                        autoComplete="new-password"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                        className={authInput}
                    />
                    {errors.password && <p className={authError}>{errors.password}</p>}
                </div>

                <div>
                    <label htmlFor="password_confirmation" className={authLabel}>
                        Ulangi password baru
                    </label>
                    <PasswordInput
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        className={authInput}
                    />
                    {errors.password_confirmation && <p className={authError}>{errors.password_confirmation}</p>}
                </div>

                <div className="pt-3">
                    <button type="submit" disabled={processing} className={authButton}>
                        {processing ? 'Menyimpan...' : 'Simpan Password'}
                    </button>
                </div>

                <div className="pt-6 text-center sm:pt-8">
                    <p className="text-xs text-[#18231f] sm:text-sm">
                        <Link href={route('login')} className="font-extrabold text-[#113d29] hover:underline">
                            Kembali ke Login
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
