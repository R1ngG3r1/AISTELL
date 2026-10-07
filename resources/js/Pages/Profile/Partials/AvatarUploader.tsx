import Avatar from '@/Components/eco/Avatar';
import ConfirmModal from '@/Components/eco/ConfirmModal';
import { User } from '@/types';
import { faCamera, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { router, usePage } from '@inertiajs/react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import AvatarCropModal from './AvatarCropModal';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
// Foto asli boleh besar karena dipangkas & dikompres di browser sebelum diunggah
// (hasilnya ±100 KB, jauh di bawah batas backend 2 MB).
const MAX_SOURCE_BYTES = 10 * 1024 * 1024;

/**
 * Foto profil: pilih file → dialog pratinjau & pangkas → Simpan → diunggah.
 * Foto belum dipakai sebelum pengguna menekan "Simpan foto".
 */
export default function AvatarUploader({ user }: { user: Pick<User, 'name' | 'avatar_url'> }) {
    const input = useRef<HTMLInputElement>(null);
    const [source, setSource] = useState<string | null>(null); // object URL foto yang sedang dipangkas
    const [progress, setProgress] = useState<number | null>(null);
    const [clientError, setClientError] = useState<string | null>(null);
    const [confirmRemove, setConfirmRemove] = useState(false);
    const [removing, setRemoving] = useState(false);
    const serverError = (usePage().props as { errors: Record<string, string> }).errors.avatar;

    const uploading = progress !== null;

    // Bebaskan memori object URL saat diganti / komponen ditutup.
    useEffect(() => () => void (source && URL.revokeObjectURL(source)), [source]);

    const pick = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = ''; // agar file yang sama bisa dipilih lagi
        if (!file) return;

        if (!ACCEPTED.includes(file.type)) return setClientError('Format foto harus JPG, PNG, atau WebP.');
        if (file.size > MAX_SOURCE_BYTES) return setClientError('Ukuran foto maksimal 10 MB.');
        setClientError(null);
        setSource(URL.createObjectURL(file));
    };

    const closeCropper = () => {
        if (!uploading) setSource(null);
    };

    // → POST /profile/avatar (multipart) dengan foto hasil pangkas
    const upload = (file: File) => {
        router.post(
            route('profile.avatar.update'),
            { avatar: file },
            {
                forceFormData: true,
                preserveScroll: true,
                onStart: () => setProgress(0),
                onProgress: (p) => setProgress(p?.percentage ?? 0),
                onSuccess: () => setSource(null),
                onFinish: () => setProgress(null),
            },
        );
    };

    const remove = () =>
        router.delete(route('profile.avatar.destroy'), {
            preserveScroll: true,
            onStart: () => setRemoving(true),
            onFinish: () => {
                setRemoving(false);
                setConfirmRemove(false);
            },
        });

    return (
        <div className="flex flex-col items-center">
            <div className="group relative">
                <button
                    type="button"
                    onClick={() => input.current?.click()}
                    className="relative block rounded-full ring-4 ring-white/20 transition hover:ring-[#4de097]/60 focus:outline-none focus-visible:ring-[#4de097]"
                    aria-label="Ganti foto profil"
                >
                    <Avatar name={user.name} src={user.avatar_url} className="h-28 w-28 text-3xl" />
                    <span className="absolute inset-0 grid place-items-center rounded-full bg-[#041b15]/55 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100">
                        Ganti foto
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => input.current?.click()}
                    className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full border-2 border-[#07271e] bg-[#4de097] text-sm text-[#07271e] shadow-soft transition hover:scale-110"
                    aria-label="Pilih foto"
                >
                    <FontAwesomeIcon icon={faCamera} />
                </button>
            </div>

            <input ref={input} type="file" accept={ACCEPTED.join(',')} className="hidden" onChange={pick} />

            {clientError && <p className="mt-3 max-w-[14rem] text-center text-xs font-semibold text-[#ffb59a]">{clientError}</p>}

            <p className="mt-3 text-center text-[11px] text-white/50">JPG, PNG, atau WebP</p>

            {user.avatar_url && (
                <button
                    type="button"
                    onClick={() => setConfirmRemove(true)}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 transition hover:text-[#ffb59a]"
                >
                    <FontAwesomeIcon icon={faTrashCan} /> Hapus foto
                </button>
            )}

            <AvatarCropModal
                src={source}
                processing={uploading}
                progress={progress}
                error={serverError}
                onConfirm={upload}
                onClose={closeCropper}
            />

            <ConfirmModal
                show={confirmRemove}
                tone="danger"
                icon={faTrashCan}
                title="Hapus foto profil?"
                message="Foto akan diganti dengan inisial nama Anda. Anda bisa mengunggah foto baru kapan saja."
                confirmText="Hapus foto"
                processing={removing}
                onConfirm={remove}
                onClose={() => setConfirmRemove(false)}
            />
        </div>
    );
}
