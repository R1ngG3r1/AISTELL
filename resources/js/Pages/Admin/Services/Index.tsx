import ConfirmModal from '@/Components/eco/ConfirmModal';
import EmptyState from '@/Components/eco/EmptyState';
import PageHeader from '@/Components/eco/PageHeader';
import ServiceIcon from '@/Components/eco/ServiceIcon';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah } from '@/lib/format';
import { Reveal } from '@/lib/motion';
import { PageProps, Service } from '@/types';
import { faClipboardList, faPen, faPlus, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

// Props dari AdminServiceController@index
export default function AdminServicesIndex({ services }: PageProps<{ services: Service[] }>) {
    // Modal form: null = tertutup, 'new' = tambah, Service = ubah
    const [editing, setEditing] = useState<Service | 'new' | null>(null);
    const [deleting, setDeleting] = useState<Service | null>(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        price: '',
    });

    const openCreate = () => {
        clearErrors();
        reset();
        setEditing('new');
    };

    const openEdit = (service: Service) => {
        clearErrors();
        setData({ name: service.name, description: service.description ?? '', price: String(Number(service.price)) });
        setEditing(service);
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
            put(route('admin.services.update', editing.id), options); // PUT /admin/services/{id}
        } else {
            post(route('admin.services.store'), options); // POST /admin/services
        }
    };

    const destroy = () => {
        if (!deleting) return;
        router.delete(route('admin.services.destroy', deleting.id), {
            preserveScroll: true,
            onStart: () => setDeleteProcessing(true),
            onFinish: () => {
                setDeleteProcessing(false);
                setDeleting(null);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    eyebrow="Kelola Layanan"
                    title="Katalog layanan"
                    description={`${services.length} layanan tersedia untuk dipesan pengguna.`}
                    actions={
                        <button onClick={openCreate} className="btn-primary">
                            <FontAwesomeIcon icon={faPlus} /> Tambah Layanan
                        </button>
                    }
                />
            }
        >
            <Head title="Kelola Layanan" />

            {services.length === 0 ? (
                <div className="card">
                    <EmptyState
                        title="Belum ada layanan"
                        description="Tambahkan layanan pertama agar pengguna bisa mulai memesan."
                        action={
                            <button onClick={openCreate} className="btn-primary">
                                <FontAwesomeIcon icon={faPlus} /> Tambah Layanan
                            </button>
                        }
                    />
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {services.map((service, i) => (
                        <Reveal key={service.id} delay={(i % 3) * 90} variant="scale">
                            <article className="group flex h-full flex-col rounded-4xl bg-white p-6 shadow-soft ring-1 ring-forest-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
                                <div className="flex items-start justify-between">
                                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-forest-900 text-leaf-400 transition group-hover:rotate-[-8deg]">
                                        <ServiceIcon name={service.name} />
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-50 px-2.5 py-1 text-xs font-semibold text-forest-600">
                                        <FontAwesomeIcon icon={faClipboardList} /> {service.orders_count ?? 0} pesanan
                                    </span>
                                </div>
                                <h3 className="mt-5 text-lg font-bold">{service.name}</h3>
                                <p className="mt-1 line-clamp-2 flex-1 text-sm text-forest-900/55">{service.description || '—'}</p>
                                <p className="display mt-4 text-2xl">{formatRupiah(service.price)}</p>
                                <div className="mt-5 flex gap-2 border-t border-forest-900/5 pt-4">
                                    <button onClick={() => openEdit(service)} className="btn-ghost btn-sm flex-1">
                                        <FontAwesomeIcon icon={faPen} /> Ubah
                                    </button>
                                    <button
                                        onClick={() => setDeleting(service)}
                                        className="btn-ghost btn-sm flex-1 text-clay-600 hover:border-clay-500/40"
                                        title={service.orders_count ? 'Layanan yang sudah dipesan tidak dapat dihapus' : undefined}
                                    >
                                        <FontAwesomeIcon icon={faTrashCan} /> Hapus
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
                        <h2 className="display text-2xl">{editing === 'new' ? 'Tambah layanan' : 'Ubah layanan'}</h2>
                        <button type="button" onClick={close} className="grid h-9 w-9 place-items-center rounded-full hover:bg-forest-900/5" aria-label="Tutup">
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Nama layanan" />
                            <TextInput id="name" value={data.name} isFocused onChange={(e) => setData('name', e.target.value)} placeholder="mis. Cuci Karpet" />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="description" value="Deskripsi" />
                            <textarea
                                id="description"
                                rows={4}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="input"
                                placeholder="Jelaskan apa saja yang dikerjakan dalam layanan ini"
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="price" value="Harga (Rp)" />
                            <div className="relative">
                                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-forest-900/40">Rp</span>
                                <TextInput
                                    id="price"
                                    type="number"
                                    min={0}
                                    className="ps-11"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    placeholder="150000"
                                />
                            </div>
                            {data.price && <p className="mt-1.5 text-xs text-forest-900/50">= {formatRupiah(data.price)}</p>}
                            <InputError message={errors.price} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button type="button" onClick={close} className="btn-ghost">
                            Batal
                        </button>
                        <button disabled={processing} className="btn-primary">
                            {processing ? 'Menyimpan…' : editing === 'new' ? 'Tambah Layanan' : 'Simpan Perubahan'}
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
                        ? 'Layanan ini sudah memiliki pesanan, sehingga sistem akan menolak penghapusan untuk menjaga riwayat pesanan.'
                        : 'Layanan akan dihapus permanen dari katalog.'
                }
                confirmText="Hapus"
                processing={deleteProcessing}
                onConfirm={destroy}
                onClose={() => setDeleting(null)}
            />
        </AuthenticatedLayout>
    );
}
