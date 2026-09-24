import { PageProps } from '@/types';
import { faCircleCheck, faCircleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type Toast = { type: 'success' | 'error'; text: string };

/**
 * Toast di pojok kanan atas untuk pesan dari backend:
 * redirect()->with('success' | 'error', '...'). Hilang otomatis setelah 5 detik.
 */
export default function FlashMessage() {
    const { flash } = usePage<PageProps>().props;
    const [toast, setToast] = useState<Toast | null>(null);

    // `flash` adalah objek baru di setiap kunjungan halaman, jadi efek ini
    // berjalan lagi walaupun teks pesannya sama.
    useEffect(() => {
        const next: Toast | null = flash?.error
            ? { type: 'error', text: flash.error }
            : flash?.success
              ? { type: 'success', text: flash.success }
              : null;
        setToast(next);
        if (!next) return;
        const timer = setTimeout(() => setToast(null), 5000);
        return () => clearTimeout(timer);
    }, [flash]);

    if (!toast) return null;

    const isError = toast.type === 'error';

    return (
        <div className="pointer-events-none fixed inset-x-4 top-20 z-[60] flex justify-end sm:inset-x-auto sm:right-6">
            <div
                role="status"
                className={`pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-2xl p-4 shadow-lift ring-1 ${
                    isError ? 'bg-clay-100 text-clay-600 ring-clay-500/20' : 'bg-forest-900 text-cream ring-white/10'
                }`}
            >
                <FontAwesomeIcon
                    icon={isError ? faCircleExclamation : faCircleCheck}
                    className={`mt-0.5 ${isError ? '' : 'text-leaf-400'}`}
                />
                <p className="flex-1 text-sm font-medium">{toast.text}</p>
                <button onClick={() => setToast(null)} className="opacity-60 transition hover:opacity-100" aria-label="Tutup">
                    <FontAwesomeIcon icon={faXmark} />
                </button>
            </div>
        </div>
    );
}
