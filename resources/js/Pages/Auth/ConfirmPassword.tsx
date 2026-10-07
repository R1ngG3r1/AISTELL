import PasswordInput from '@/Components/eco/PasswordInput';
import GuestLayout, { authButton, authError, authInput, authLabel } from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout title="Konfirmasi Password" subtitle="Ini area aman. Masukkan password Anda untuk melanjutkan.">
            <Head title="Konfirmasi Password - AISTEL" />

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="password" className={`${authLabel} sm:sr-only`}>
                        Password
                    </label>
                    <PasswordInput
                        id="password"
                        name="password"
                        value={data.password}
                        placeholder="Password"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                        className={authInput}
                    />
                    {errors.password && <p className={authError}>{errors.password}</p>}
                </div>

                <div className="pt-3">
                    <button type="submit" disabled={processing} className={authButton}>
                        Konfirmasi
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
