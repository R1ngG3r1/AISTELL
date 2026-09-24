import { OrderStatus } from '@/types';

export function formatRupiah(value: string | number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value));
}

export function formatDate(value: string): string {
    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

/** "09:00:00" → "09:00" */
export function formatTime(value: string): string {
    return value.slice(0, 5);
}

export const statusColors: Record<OrderStatus, string> = {
    menunggu: 'bg-yellow-100 text-yellow-800',
    diproses: 'bg-blue-100 text-blue-800',
    selesai: 'bg-green-100 text-green-800',
    ditolak: 'bg-red-100 text-red-800',
    dibatalkan: 'bg-gray-100 text-gray-700',
};
