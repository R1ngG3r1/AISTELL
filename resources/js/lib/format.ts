import { Order } from '@/types';

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

/** "09:00:00" → "09:00 WIB" (waktu pesanan disimpan dalam WIB) */
export function formatTime(value: string): string {
    return `${value.slice(0, 5)} WIB`;
}


/**
 * Harga pesanan: harga yang dikunci saat pesanan dibuat (order.price).
 * Fallback ke harga layanan untuk data lama yang belum memiliki kolom price.
 */
export function orderPrice(order: Pick<Order, 'price' | 'service'>): string | null {
    return order.price ?? order.service?.price ?? null;
}
