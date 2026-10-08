// Bentuk data yang dikirim backend (Laravel) ke halaman React lewat Inertia props.
// Kalau backend menambah/mengubah field, perbarui juga di sini.

export type Role = 'user' | 'admin';

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    avatar_url?: string | null; // null = belum ada foto (tampil inisial)
    role: Role;
    email_verified_at?: string | null;
}

export interface Service {
    id: number;
    name: string;
    description: string | null;
    price: string; // decimal dari Laravel dikirim sebagai string, mis. "150000.00"
    orders_count?: number; // hanya ada di halaman admin
}

export type OrderStatus =
    | 'menunggu'
    | 'diproses'
    | 'selesai'
    | 'ditolak'
    | 'dibatalkan';

export interface Order {
    id: number;
    user_id: number;
    service_id: number;
    price: string | null; // harga saat pesanan dibuat, mis. "150000.00"
    date: string; // "2026-09-25"
    time: string; // "09:00:00"
    location: string;
    latitude: number | null; // titik peta lokasi (null = tidak dipilih)
    longitude: number | null;
    contact_name: string;
    contact_phone: string;
    notes: string | null;
    status: OrderStatus;
    status_label: string;
    created_at: string;
    updated_at: string;
    service?: Pick<Service, 'id' | 'name' | 'price'> & { description?: string | null };
    payment?: Payment | null; // pembayaran terbaru (null = belum memilih metode)
    user?: Pick<User, 'id' | 'name' | 'email' | 'phone' | 'avatar_url'>;
}

export type PaymentStatus = 'menunggu' | 'lunas' | 'kedaluwarsa' | 'dibatalkan' | 'dikembalikan';
export type PaymentGroup = 'qris' | 'va' | 'ewallet' | 'retail' | 'cod';

/** Pembayaran DUMMY (app/Modules/Payment). */
export interface Payment {
    id: number;
    order_id: number;
    method: string; // "qris", "va_bca", "gopay", "alfamart", "cod", …
    method_label: string; // "BCA Virtual Account"
    method_group: PaymentGroup;
    amount: string; // total bayar = harga + biaya layanan, mis. "154000.00"
    fee: string;
    status: PaymentStatus;
    status_label: string;
    reference: string; // no. transaksi, mis. "AST-20261008-K3J9QX"
    code: string | null; // nomor VA / kode bayar gerai / isi QR
    expires_at: string | null; // null = tanpa batas waktu (tunai)
    paid_at: string | null;
    created_at: string;
}

/** Pilihan metode di halaman pembayaran (PaymentMethod::toOption). */
export interface PaymentMethodOption {
    value: string;
    label: string;
    group: PaymentGroup;
    fee: number;
}

/** Buku alamat user (AddressService::listFor), alamat utama di urutan pertama. */
export interface Address {
    id: number;
    label: string; // "Rumah", "Kantor", …
    address: string;
    detail: string | null; // no. rumah, blok, patokan
    latitude: number | null;
    longitude: number | null;
    is_primary: boolean;
}

export interface StatusOption {
    value: OrderStatus;
    label: string;
}

/** Ringkasan dashboard: total + jumlah per status. */
export type OrderStats = { total: number } & Record<OrderStatus, number>;

/** Data kalender dashboard: jumlah jadwal per tanggal (OrderService::schedule). */
export interface ScheduleDay {
    date: string; // "2026-10-08"
    total: number;
}

/** Badge sidebar (OrderService::counters): admin → pendingOrders, user → activeOrders. */
export interface Counters {
    pendingOrders?: number;
    activeOrders?: number;
}

/** Hasil ->paginate() Laravel. */
export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash: {
        success?: string | null;
        error?: string | null;
    };
    /** Jam server untuk jam realtime (HandleInertiaRequests). */
    clock: {
        now: string; // ISO 8601, mis. "2026-10-07T14:05:09+07:00"
        timezone: string; // "Asia/Jakarta"
    };
    counters: Counters | null;
};
