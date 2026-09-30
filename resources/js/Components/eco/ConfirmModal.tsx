import Modal from '@/Components/Modal';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/** Dialog konfirmasi yang lebih ramah daripada window.confirm(). */
export default function ConfirmModal({
    show,
    title,
    message,
    confirmText = 'Ya, lanjutkan',
    tone = 'primary',
    icon = faTriangleExclamation,
    processing = false,
    onConfirm,
    onClose,
}: {
    show: boolean;
    title: string;
    message?: string;
    confirmText?: string;
    tone?: 'primary' | 'danger';
    icon?: IconDefinition;
    processing?: boolean;
    onConfirm: () => void;
    onClose: () => void;
}) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-7 text-center">
                <div
                    className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl text-xl ${
                        tone === 'danger' ? 'bg-clay-100 text-clay-600' : 'bg-leaf-100 text-forest-700'
                    }`}
                >
                    <FontAwesomeIcon icon={icon} />
                </div>
                <h3 className="display mt-4 text-2xl text-forest-900">{title}</h3>
                {message && <p className="mt-2 text-sm text-forest-900/60">{message}</p>}
                <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
                    <button type="button" className="btn-ghost" onClick={onClose} disabled={processing}>
                        Batal
                    </button>
                    <button
                        type="button"
                        className={tone === 'danger' ? 'btn-danger' : 'btn-primary'}
                        onClick={onConfirm}
                        disabled={processing}
                    >
                        {processing ? 'Memproses…' : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
