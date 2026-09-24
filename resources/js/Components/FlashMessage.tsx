import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';

/** Menampilkan pesan dari backend: redirect()->with('success' | 'error', '...') */
export default function FlashMessage() {
    const { flash } = usePage<PageProps>().props;

    return (
        <>
            {flash?.success && (
                <div className="mb-4 rounded-md bg-green-50 p-4 text-sm font-medium text-green-800">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 rounded-md bg-red-50 p-4 text-sm font-medium text-red-800">
                    {flash.error}
                </div>
            )}
        </>
    );
}
