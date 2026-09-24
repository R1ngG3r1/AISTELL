import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah } from '@/lib/format';
import { PageProps, Service } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

// Props dari AdminServiceController@index
export default function AdminServicesIndex({ services }: PageProps<{ services: Service[] }>) {
    // null = mode tambah, berisi layanan = mode ubah
    const [editing, setEditing] = useState<Service | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        price: '',
    });

    const startEdit = (service: Service) => {
        setEditing(service);
        clearErrors();
        setData({
            name: service.name,
            description: service.description ?? '',
            price: String(Number(service.price)),
        });
    };

    const cancelEdit = () => {
        setEditing(null);
        clearErrors();
        reset();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: cancelEdit };
        if (editing) {
            put(route('admin.services.update', editing.id), options); // PUT /admin/services/{id}
        } else {
            post(route('admin.services.store'), options); // POST /admin/services
        }
    };

    const destroy = (service: Service) => {
        if (confirm(`Hapus layanan "${service.name}"?`)) {
            router.delete(route('admin.services.destroy', service.id), { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Kelola Layanan</h2>}
        >
            <Head title="Kelola Layanan" />

            <div className="py-6">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
                    <form onSubmit={submit} className="space-y-4 rounded-lg bg-white p-6 shadow-sm lg:col-span-1">
                        <h3 className="font-semibold text-gray-900">{editing ? 'Ubah Layanan' : 'Tambah Layanan'}</h3>

                        <div>
                            <InputLabel htmlFor="name" value="Nama Layanan" />
                            <TextInput
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="Deskripsi" />
                            <textarea
                                id="description"
                                rows={4}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="price" value="Harga (Rp)" />
                            <TextInput
                                id="price"
                                type="number"
                                min={0}
                                className="mt-1 block w-full"
                                value={data.price}
                                onChange={(e) => setData('price', e.target.value)}
                            />
                            <InputError message={errors.price} className="mt-2" />
                        </div>

                        <div className="flex gap-2">
                            <PrimaryButton disabled={processing}>{editing ? 'Simpan' : 'Tambah'}</PrimaryButton>
                            {editing && (
                                <SecondaryButton type="button" onClick={cancelEdit}>
                                    Batal
                                </SecondaryButton>
                            )}
                        </div>
                    </form>

                    <div className="overflow-x-auto rounded-lg bg-white shadow-sm lg:col-span-2">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-4 py-3">Layanan</th>
                                    <th className="px-4 py-3">Harga</th>
                                    <th className="px-4 py-3">Pesanan</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {services.map((service) => (
                                    <tr key={service.id}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{service.name}</p>
                                            <p className="line-clamp-2 text-xs text-gray-500">{service.description}</p>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">{formatRupiah(service.price)}</td>
                                        <td className="px-4 py-3">{service.orders_count}</td>
                                        <td className="whitespace-nowrap px-4 py-3 text-right">
                                            <SecondaryButton onClick={() => startEdit(service)} className="me-2">
                                                Ubah
                                            </SecondaryButton>
                                            <DangerButton onClick={() => destroy(service)}>Hapus</DangerButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
