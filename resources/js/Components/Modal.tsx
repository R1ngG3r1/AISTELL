import { PropsWithChildren, useEffect } from 'react';

export default function Modal({
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
}: PropsWithChildren<{
    show: boolean;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    closeable?: boolean;
    onClose: CallableFunction;
}>) {
    // Tutup dengan tombol Escape & kunci scroll halaman saat modal terbuka
    useEffect(() => {
        if (!show) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeable && onClose();
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [show, closeable, onClose]);

    if (!show) {
        return null;
    }

    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
    }[maxWidth];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-6 sm:px-0" role="dialog" aria-modal="true">
            <div className="fixed inset-0 animate-[fade-up_.2s_ease-out_both] bg-forest-950/50 backdrop-blur-sm" onClick={close} />

            <div
                className={`relative w-full animate-scale-in overflow-hidden rounded-4xl bg-cream shadow-lift ring-1 ring-forest-900/10 sm:mx-auto ${maxWidthClass}`}
            >
                {children}
            </div>
        </div>
    );
}
