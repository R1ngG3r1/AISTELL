import ConfirmModal from '@/Components/eco/ConfirmModal';
import InputError from '@/Components/InputError';
import { Stars, StarInput } from '@/Components/eco/Rating';
import { formatDate } from '@/lib/format';
import { Order } from '@/types';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

/**
 * Ulasan sebuah pesanan.
 * - Sudah diulas → tampil bintang + komentar; pemilik (`canWrite`) bisa mengubah atau menghapusnya.
 * - Belum, pesanan selesai, dan `canWrite` (pemilik) → formulir ulasan.
 * - Selain itu tidak menampilkan apa pun.
 */
export default function ReviewCard({ order, canWrite = false }: { order: Order; canWrite?: boolean }) {
    const review = order.review;
    const form = useForm({ rating: review?.rating ?? 0, comment: review?.comment ?? '' });
    const [editing, setEditing] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [deleting, setDeleting] = useState(false);

    if (!review && (!canWrite || order.status !== 'selesai')) return null;

    // Tampilan baca: ulasan ada dan tidak sedang diedit.
    if (review && !editing) {
        const edited = Date.parse(review.updated_at) - Date.parse(review.created_at) > 1000;

        const remove = () =>
            router.delete(route('orders.review.destroy', order.id), {
                preserveScroll: true,
                onStart: () => setDeleting(true),
                onFinish: () => {
                    setDeleting(false);
                    setConfirming(false);
                    form.setData({ rating: 0, comment: '' }); // jika nanti mengulas lagi, mulai dari formulir kosong
                },
            });

        return (
            <div className="card p-6 md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <h2 className="display text-2xl">{canWrite ? 'Ulasan Anda' : 'Ulasan pelanggan'}</h2>
                    {canWrite && (
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setEditing(true)} className="btn-ghost btn-sm">
                                <FontAwesomeIcon icon={faPen} /> Ubah
                            </button>
                            <button type="button" onClick={() => setConfirming(true)} className="btn-ghost btn-sm text-clay-600 hover:border-clay-500/40">
                                <FontAwesomeIcon icon={faTrash} /> Hapus
                            </button>
                        </div>
                    )}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Stars value={review.rating} className="text-xl" />
                    <span className="text-sm text-forest-900/50">
                        {formatDate(review.created_at)}
                        {edited && ' · diubah'}
                    </span>
                </div>
                <p className="mt-3 whitespace-pre-line break-words text-forest-900/80">
                    {review.comment || <span className="text-forest-900/40">Tanpa komentar.</span>}
                </p>

                <ConfirmModal
                    show={confirming}
                    tone="danger"
                    icon={faTrash}
                    title="Hapus ulasan?"
                    message="Ulasan Anda akan dihapus dari halaman layanan. Anda bisa menulis ulasan baru kapan saja."
                    confirmText="Ya, hapus"
                    processing={deleting}
                    onConfirm={remove}
                    onClose={() => setConfirming(false)}
                />
            </div>
        );
    }

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (review) {
            form.put(route('orders.review.update', order.id), { preserveScroll: true, onSuccess: () => setEditing(false) });
        } else {
            form.post(route('orders.review.store', order.id), { preserveScroll: true });
        }
    };

    const cancelEdit = () => {
        form.setData({ rating: review?.rating ?? 0, comment: review?.comment ?? '' });
        form.clearErrors();
        setEditing(false);
    };

    return (
        <form onSubmit={submit} className="card p-6 md:p-8">
            <h2 className="display text-2xl">{review ? 'Ubah ulasan' : 'Beri ulasan'}</h2>
            <p className="mt-1 text-sm text-forest-900/60">Bagaimana layanan {order.service?.name}? Masukan Anda membantu kami dan pelanggan lain.</p>

            <div className="mt-5">
                <StarInput value={form.data.rating} onChange={(rating) => form.setData('rating', rating)} />
                <InputError message={form.errors.rating} className="mt-1" />
            </div>

            <label className="mt-4 block">
                <span className="text-sm font-semibold text-forest-900/70">Komentar (opsional)</span>
                <textarea
                    value={form.data.comment}
                    onChange={(e) => form.setData('comment', e.target.value)}
                    rows={4}
                    maxLength={1000}
                    placeholder="Ceritakan pengalaman Anda…"
                    className="input mt-1.5"
                />
                <InputError message={form.errors.comment} className="mt-1" />
            </label>

            <div className="mt-5 flex gap-2">
                <button type="submit" disabled={form.processing} className="btn-primary">
                    {review ? 'Simpan perubahan' : 'Kirim ulasan'}
                </button>
                {review && (
                    <button type="button" onClick={cancelEdit} className="btn-ghost">
                        Batal
                    </button>
                )}
            </div>
        </form>
    );
}
