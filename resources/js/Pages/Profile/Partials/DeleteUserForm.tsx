import PasswordInput from '@/Components/eco/PasswordInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }: { className?: string }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<{ focus: () => void }>(null);

    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        password: '',
    });

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={className}>
            <header>
                <h2 className="display text-2xl text-clay-600">Hapus akun</h2>
                <p className="mt-1 text-sm text-forest-900/60">
                    Setelah akun dihapus, semua data termasuk riwayat pesanan akan terhapus permanen dan tidak dapat dipulihkan.
                </p>
            </header>

            <button onClick={() => setConfirmingUserDeletion(true)} className="btn-danger mt-5">
                <FontAwesomeIcon icon={faTrashCan} /> Hapus Akun
            </button>

            <Modal show={confirmingUserDeletion} onClose={closeModal} maxWidth="md">
                <form onSubmit={deleteUser} className="p-7">
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-clay-100 text-xl text-clay-600">
                        <FontAwesomeIcon icon={faTrashCan} />
                    </div>
                    <h2 className="display mt-4 text-center text-2xl">Yakin ingin menghapus akun?</h2>
                    <p className="mt-2 text-center text-sm text-forest-900/60">
                        Masukkan password untuk mengonfirmasi. Tindakan ini tidak dapat dibatalkan.
                    </p>

                    <div className="mt-6">
                        <InputLabel htmlFor="password" value="Password" className="sr-only" />
                        <PasswordInput
                            id="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            isFocused
                            placeholder="Password"
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button type="button" onClick={closeModal} className="btn-ghost">
                            Batal
                        </button>
                        <button className="btn-danger" disabled={processing}>
                            {processing ? 'Menghapus…' : 'Hapus Akun'}
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
