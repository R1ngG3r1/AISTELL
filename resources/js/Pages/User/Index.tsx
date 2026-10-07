import Avatar from '@/Components/eco/Avatar';
import EmptyState from '@/Components/eco/EmptyState';
import PageHeader from '@/Components/eco/PageHeader';
import Pagination from '@/Components/Pagination';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate } from '@/lib/format';
import { Reveal } from '@/lib/motion';
import { PageProps, Paginated, User } from '@/types';
import { faTerminal } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head } from '@inertiajs/react';

type Row = Pick<User, 'id' | 'name' | 'email' | 'phone' | 'role' | 'avatar_url'> & { created_at: string; orders_count: number };

// Props dari app/Modules/User/Controllers/UserController@index
export default function UserIndex({ users }: PageProps<{ users: Paginated<Row> }>) {
    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    eyebrow="Pengguna"
                    title="Daftar akun"
                    description={`${users.total} akun terdaftar. Akun baru hasil pendaftaran otomatis menjadi user.`}
                />
            }
        >
            <Head title="Pengguna" />

            <Reveal className="card overflow-hidden">
                {users.data.length === 0 ? (
                    <EmptyState title="Belum ada pengguna" />
                ) : (
                    <>
                    <ul className="divide-y divide-[#e6ece1] md:hidden">
                        {users.data.map((u) => (
                            <li key={u.id} className="flex items-center gap-3 px-5 py-4">
                                <Avatar name={u.name} src={u.avatar_url} className="h-10 w-10" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="truncate text-sm font-bold">{u.name}</p>
                                        <span
                                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                                u.role === 'admin' ? 'bg-forest-900 text-leaf-400' : 'bg-forest-50 text-forest-600'
                                            }`}
                                        >
                                            {u.role}
                                        </span>
                                    </div>
                                    <p className="truncate text-xs text-forest-900/50">{u.email}</p>
                                    <p className="mt-1 text-[11px] text-forest-900/50">
                                        {u.phone || 'Tanpa telepon'} · {u.orders_count} pesanan · bergabung {formatDate(u.created_at)}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="hidden overflow-x-auto md:block">
                        <table className="table-eco">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Telepon</th>
                                    <th>Role</th>
                                    <th>Pesanan</th>
                                    <th>Bergabung</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((u) => (
                                    <tr key={u.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <Avatar name={u.name} src={u.avatar_url} />
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold">{u.name}</p>
                                                    <p className="truncate text-xs text-forest-900/45">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap text-forest-900/60">{u.phone || '—'}</td>
                                        <td>
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                                                    u.role === 'admin' ? 'bg-forest-900 text-leaf-400' : 'bg-forest-50 text-forest-600'
                                                }`}
                                            >
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="font-semibold tabular-nums">{u.orders_count}</td>
                                        <td className="whitespace-nowrap text-forest-900/60">{formatDate(u.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    </>
                )}
            </Reveal>
            <Pagination meta={users} />

            <Reveal delay={120} className="mt-6 flex items-start gap-3 rounded-3xl bg-sand-200/70 p-5 text-sm text-forest-900/70">
                <FontAwesomeIcon icon={faTerminal} className="mt-0.5 text-forest-500" />
                <p>
                    Untuk menambah admin atau mengubah role, gunakan perintah{' '}
                    <code className="rounded bg-white px-1.5 py-0.5 text-forest-900">php artisan aistel:create-admin</code> atau{' '}
                    <code className="rounded bg-white px-1.5 py-0.5 text-forest-900">aistel:set-role</code>. Panduan lengkap ada di{' '}
                    <code className="rounded bg-white px-1.5 py-0.5 text-forest-900">docs/PANDUAN_DATABASE.md</code>.
                </p>
            </Reveal>
        </AuthenticatedLayout>
    );
}
