import Avatar from '@/Components/eco/Avatar';
import { Leaf } from '@/Components/eco/Illustrations';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Reveal } from '@/lib/motion';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ auth, mustVerifyEmail, status }: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const isAdmin = auth.user.role === 'admin';

    return (
        <AuthenticatedLayout>
            <Head title="Profil Saya" />

            <div className="grid items-start gap-6 lg:grid-cols-[18rem_1fr]">
                {/* Kartu identitas */}
                <Reveal variant="left" className="relative overflow-hidden rounded-4xl bg-forest-900 p-7 text-center text-cream shadow-lift lg:sticky lg:top-24">
                    <Leaf className="absolute -right-10 -top-10 h-40 w-40 rotate-12 text-forest-800" />
                    <Avatar name={auth.user.name} className="relative mx-auto h-20 w-20 text-2xl ring-4 ring-forest-800" />
                    <h1 className="display relative mt-4 text-2xl">{auth.user.name}</h1>
                    <p className="relative truncate text-sm text-cream/60">{auth.user.email}</p>
                    <span className="relative mt-4 inline-flex rounded-full bg-leaf-400 px-3 py-1 text-xs font-bold uppercase tracking-wider text-forest-900">
                        {isAdmin ? 'Admin' : 'User'}
                    </span>
                </Reveal>

                <div className="space-y-6">
                    <Reveal className="card p-6 md:p-8">
                        <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} className="max-w-xl" />
                    </Reveal>

                    <Reveal delay={80} className="card p-6 md:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </Reveal>

                    {/* Akun admin tidak bisa dihapus (dicegah juga di ProfileController@destroy) */}
                    {!isAdmin && (
                        <Reveal delay={160} className="rounded-3xl bg-clay-100/60 p-6 ring-1 ring-clay-500/15 md:p-8">
                            <DeleteUserForm className="max-w-xl" />
                        </Reveal>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
