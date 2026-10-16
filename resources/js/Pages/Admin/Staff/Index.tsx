import Avatar from '@/Components/eco/Avatar';
import ConfirmModal from '@/Components/eco/ConfirmModal';
import EmptyState from '@/Components/eco/EmptyState';
import PageHeader from '@/Components/eco/PageHeader';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Reveal } from '@/lib/motion';
import StaffTypeBadge from '@/Components/eco/StaffTypeBadge';
import { PageProps, Staff, StaffType } from '@/types';
import { faCalendarCheck, faPen, faPhone, faPlus, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

// Props dari AdminStaffController@index
export default function AdminStaffIndex({ staff }: PageProps<{ staff: Staff[] }>) {
    // Modal form: null = tertutup, 'new' = tambah, Staff = ubah
    const [editing, setEditing] = useState<Staff | 'new' | null>(null);
    const [deleting, setDeleting] = useState<Staff | null>(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<{ name: string; phone: string; type: StaffType; is_active: boolean }>({
        name: '',
        phone: '',
        type: 'solo',
        is_active: true,
    });

    const openCreate = () => {
        clearErrors();
        reset();
        setEditing('new');
    };

    const openEdit = (s: Staff) => {
        clearErrors();
        setData({ name: s.name, phone: s.phone, type: s.type, is_active: s.is_active });
        setEditing(s);
    };

    const close = () => {
        setEditing(null);
        clearErrors();
        reset();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: close };
        if (editing && editing !== 'new') {
            put(route('admin.staff.update', editing.id), options);
        } else {
            post(route('admin.staff.store'), options);
        }
    };

    const toggleActive = (s: Staff) =>
        router.put(route('admin.staff.update', s.id), { name: s.name, phone: s.phone, type: s.type, is_active: !s.is_active }, { preserveScroll: true });

    const destroy = () => {
        if (!deleting) return;
        router.delete(route('admin.staff.destroy', deleting.id), {
            preserveScroll: true,
            onStart: () => setDeleteProcessing(true),
            onFinish: () => {
                setDeleteProcessing(false);
                setDeleting(null);
            },
        });
    };

    const activeCount = staff.filter((s) => s.is_active).length;

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    eyebrow="Kelola Petugas"
                    title="Petugas lapangan"
                    description={`${activeCount} petugas aktif dari ${staff.length}. Tugaskan petugas dari halaman detail pesanan.`}
                    actions={
                        <button onClick={openCreate} className="btn-primary">
                            <FontAwesomeIcon icon={faPlus} /> Tambah Petugas
                        </button>
                    }
                />
            }
        >
            <Head title="Kelola Petugas" />

            {staff.length === 0 ? (
                <div className="card">
                    <EmptyState
                        title="Belum ada petugas"
                        description="Catat nama dan nomor telepon petugas agar bisa ditugaskan pada pesanan."
                        action={
                            <button onClick={openCreate} className="btn-primary">
                                <FontAwesomeIcon icon={faPlus} /> Tambah Petugas
                            </button>
                        }
                    />
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {staff.map((s, i) => (
                        <Reveal key={s.id} delay={(i % 3) * 90} variant="scale">
                            <article
                                className={`flex h-full flex-col rounded-4xl bg-white p-6 shadow-soft ring-1 ring-forest-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-lift ${
                                    s.is_active ? '' : 'opacity-70'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar name={s.name} className="h-14 w-14 text-lg" />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-lg font-bold">{s.name}</h3>
                                        {s.type === 'tim' && <p className="text-xs font-semibold text-sun-600">Penanggung jawab tim</p>}
                                        <a href={`tel:${s.phone}`} className="mt-0.5 inline-flex items-center gap-1.5 py-1 text-sm text-forest-900/60 hover:text-forest-600">
                                            <FontAwesomeIcon icon={faPhone} className="text-xs" /> {s.phone}
                                        </a>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                                    <StaffTypeBadge type={s.type} />
                                    <span className={`rounded-full px-2.5 py-1 ${s.is_active ? 'bg-leaf-100 text-forest-700' : 'bg-forest-900/5 text-forest-900/50'}`}>
                                        {s.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-50 px-2.5 py-1 text-forest-600">
                                        <FontAwesomeIcon icon={faCalendarCheck} /> {s.upcoming_orders_count ?? 0} jadwal mendatang
                                    </span>
                                    <span className="rounded-full bg-forest-50 px-2.5 py-1 text-forest-600">{s.orders_count ?? 0} pesanan total</span>
                                </div>

                                <div className="mt-5 flex gap-2 border-t border-forest-900/5 pt-4">
                                    <button onClick={() => openEdit(s)} className="btn-ghost btn-sm flex-1">
                                        <FontAwesomeIcon icon={faPen} /> Ubah
                                    </button>
                                    <button onClick={() => toggleActive(s)} className="btn-ghost btn-sm flex-1">
                                        {s.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                    </button>
                                    <button
                                        onClick={() => setDeleting(s)}
                                        className="btn-ghost btn-sm text-clay-600 hover:border-clay-500/40"
                                        aria-label={`Hapus ${s.name}`}
                                        title={s.orders_count ? 'Petugas yang pernah ditugaskan tidak dapat dihapus' : 'Hapus'}
                                    >
                                        <FontAwesomeIcon icon={faTrashCan} />
                                    </button>
                                </div>
                            </article>
                        </Reveal>
                    ))}
                </div>
            )}

            {/* Modal tambah / ubah */}
            <Modal show={editing !== null} onClose={close} maxWidth="lg">
                <form onSubmit={submit} className="p-7">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="display text-2xl">{editing === 'new' ? 'Tambah petugas' : 'Ubah petugas'}</h2>
                        <button type="button" onClick={close} className="grid h-9 w-9 place-items-center rounded-full hover:bg-forest-900/5" aria-label="Tutup">
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="staff-name" value="Nama petugas" />
                            <TextInput id="staff-name" value={data.name} isFocused onChange={(e) => setData('name', e.target.value)} placeholder="mis. Budi Santoso" />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="staff-phone" value="Nomor telepon" />
                            <TextInput id="staff-phone" type="tel" value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="081234567890" />
                            <InputError message={errors.phone} className="mt-2" />
                        </div>
                        <fieldset>
                            <legend className="text-sm font-semibold text-forest-900/70">Jenis petugas</legend>
                            <div className="mt-2 grid grid-cols-2 gap-3">
                                {(
                                    [
                                        { value: 'solo', title: 'Solo', hint: 'Turun ke lapangan sendiri' },
                                        { value: 'tim', title: 'Tim', hint: 'Bersama tim, petugas ini penanggung jawabnya' },
                                    ] as const
                                ).map((o) => (
                                    <label
                                        key={o.value}
                                        className={`cursor-pointer rounded-2xl border-2 p-3 transition ${
                                            data.type === o.value ? 'border-forest-500 bg-forest-50' : 'border-forest-900/10 hover:border-forest-900/25'
                                        }`}
                                    >
                                        <input type="radio" name="staff-type" value={o.value} checked={data.type === o.value} onChange={() => setData('type', o.value)} className="sr-only" />
                                        <span className="block text-sm font-bold">{o.title}</span>
                                        <span className="mt-0.5 block text-xs text-forest-900/55">{o.hint}</span>
                                    </label>
                                ))}
                            </div>
                            {data.type === 'tim' && (
                                <p className="mt-2 text-xs text-forest-900/55">Anggota tim tidak perlu dicatat. Nama di atas dicantumkan sebagai penanggung jawab.</p>
                            )}
                            <InputError message={errors.type} className="mt-2" />
                        </fieldset>
                        <label className="flex items-center gap-3 text-sm">
                            <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="h-4 w-4 rounded border-forest-900/20 text-forest-600" />
                            Aktif (bisa ditugaskan pada pesanan baru)
                        </label>
                    </div>

                    <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button type="button" onClick={close} className="btn-ghost">
                            Batal
                        </button>
                        <button disabled={processing} className="btn-primary">
                            {processing ? 'Menyimpan…' : editing === 'new' ? 'Tambah Petugas' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                show={!!deleting}
                tone="danger"
                icon={faTrashCan}
                title={`Hapus "${deleting?.name}"?`}
                message={
                    deleting?.orders_count
                        ? 'Petugas ini pernah ditugaskan pada pesanan, sehingga sistem akan menolak penghapusan untuk menjaga riwayat. Gunakan Nonaktifkan.'
                        : 'Data petugas akan dihapus permanen.'
                }
                confirmText="Hapus"
                processing={deleteProcessing}
                onConfirm={destroy}
                onClose={() => setDeleting(null)}
            />
        </AuthenticatedLayout>
    );
}
