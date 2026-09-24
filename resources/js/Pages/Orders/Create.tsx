import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah } from '@/lib/format';
import { PageProps, Service } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

// Props dari OrderController@create
type Props = PageProps<{ services: Service[]; selectedServiceId: number | null }>;

export default function OrderCreate({ auth, services, selectedServiceId }: Props) {
    // useForm Inertia: menyimpan isi form + error validasi dari backend (StoreOrderRequest).
    // Nama & telepon diisi otomatis dari akun, tapi boleh diubah.
    const { data, setData, post, processing, errors } = useForm({
        service_id: selectedServiceId ? String(selectedServiceId) : '',
        contact_name: auth.user.name,
        contact_phone: auth.user.phone ?? '',
        location: '',
        date: '',
        time: '',
        notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('orders.store')); // → POST /orders
    };

    // Format YYYY-MM-DD sesuai zona waktu lokal (en-CA kebetulan memakai format itu).
    const today = new Date().toLocaleDateString('en-CA');

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Pesan Layanan</h2>}
        >
            <Head title="Pesan Layanan" />

            <div className="py-6">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-5 rounded-lg bg-white p-6 shadow-sm">
                        <div>
                            <InputLabel htmlFor="service_id" value="Jenis Layanan" />
                            <select
                                id="service_id"
                                value={data.service_id}
                                onChange={(e) => setData('service_id', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">— Pilih layanan —</option>
                                {services.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} ({formatRupiah(s.price)})
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.service_id} className="mt-2" />
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="contact_name" value="Nama Pemesan" />
                                <TextInput
                                    id="contact_name"
                                    className="mt-1 block w-full"
                                    value={data.contact_name}
                                    onChange={(e) => setData('contact_name', e.target.value)}
                                />
                                <InputError message={errors.contact_name} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="contact_phone" value="Nomor Kontak" />
                                <TextInput
                                    id="contact_phone"
                                    type="tel"
                                    className="mt-1 block w-full"
                                    value={data.contact_phone}
                                    onChange={(e) => setData('contact_phone', e.target.value)}
                                />
                                <InputError message={errors.contact_phone} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="location" value="Lokasi Layanan" />
                            <textarea
                                id="location"
                                rows={3}
                                value={data.location}
                                onChange={(e) => setData('location', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <InputError message={errors.location} className="mt-2" />
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="date" value="Tanggal Layanan" />
                                <TextInput
                                    id="date"
                                    type="date"
                                    min={today}
                                    className="mt-1 block w-full"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                />
                                <InputError message={errors.date} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="time" value="Waktu Layanan" />
                                <TextInput
                                    id="time"
                                    type="time"
                                    className="mt-1 block w-full"
                                    value={data.time}
                                    onChange={(e) => setData('time', e.target.value)}
                                />
                                <InputError message={errors.time} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="notes" value="Catatan Tambahan (opsional)" />
                            <textarea
                                id="notes"
                                rows={3}
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <InputError message={errors.notes} className="mt-2" />
                        </div>

                        <PrimaryButton disabled={processing}>Kirim Pesanan</PrimaryButton>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
