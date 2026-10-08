import { PropsWithChildren, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
}: PropsWithChildren<{
    show: boolean;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
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
        '4xl': 'sm:max-w-4xl',
    }[maxWidth];

    // Wadah luar yang di-scroll, lalu wadah dalam min-h-full untuk memusatkan panel.
    // (Jika panel dipusatkan langsung di wadah scroll, bagian atas panel yang lebih
    // tinggi dari layar akan terpotong dan tidak bisa di-scroll.)
    // createPortal → modal dirender langsung di <body>. Tanpa ini, modal di dalam elemen
    // ber-transform (mis. animasi <Reveal>) ikut "terkurung" di kartu tersebut, karena
    // position: fixed menjadi relatif terhadap elemen ber-transform, bukan layar.
    return createPortal(
        <div className="fixed inset-0 z-[100] overflow-y-auto" role="dialog" aria-modal="true">
            <div className="fixed inset-0 animate-[fade-up_.2s_ease-out_both] bg-forest-950/50 backdrop-blur-sm" />

            <div className="relative flex min-h-full items-center justify-center p-4 sm:p-6" onClick={(e) => e.target === e.currentTarget && close()}>
                <div className={`relative w-full animate-scale-in overflow-hidden rounded-4xl bg-cream shadow-lift ring-1 ring-forest-900/10 ${maxWidthClass}`}>
                    {children}
                </div>
            </div>
        </div>,
        document.body,
    );
}
