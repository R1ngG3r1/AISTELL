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
    duration_minutes?: number; // perkiraan lama pengerjaan, dipakai mendeteksi jadwal petugas bentrok
    reviews_avg_rating?: string | null; // rata-rata rating, null = belum ada ulasan
    reviews_count?: number;
}

/** solo = turun sendiri; tim = bersama tim (anggota tidak dicatat, nama petugas = penanggung jawab). */
export type StaffType = 'solo' | 'tim';

/** Petugas lapangan: hanya data yang dicatat admin, tanpa akun (app/Modules/Staff). */
export interface Staff {
    id: number;
    name: string;
    phone: string;
    type: StaffType;
    is_active: boolean;
    orders_count?: number; // total pesanan yang pernah ditangani (halaman admin)
    upcoming_orders_count?: number; // pesanan aktif mulai hari ini
}

/** Pilihan petugas di halaman pesanan admin; `busy` = alasan jadwal bentrok, null = bisa ditugaskan. */
export interface StaffOption extends Pick<Staff, 'id' | 'name' | 'phone' | 'type' | 'is_active'> {
    busy: string | null;
}

/** Ulasan pesanan (user & admin melihat detailnya; halaman layanan memakai PublicReview). */
export interface Review {
    id: number;
    rating: number; // 1–5
    comment: string | null;
    created_at: string;
    updated_at: string; // beda dengan created_at = ulasan pernah diubah
}

/** Ulasan di halaman layanan (Review::toPublic), nama pengulas disingkat. */
export interface PublicReview extends Omit<Review, 'updated_at'> {
    reviewer: string;
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
    review?: Review | null; // ulasan user (null = belum diulas)
    staff_id?: number | null;
    staff?: Pick<Staff, 'id' | 'name' | 'phone' | 'type'> | null; // petugas yang ditugaskan admin
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

/** Filter daftar pesanan (OrderFilterRequest::forView); null/kosong = tidak difilter. */
export interface OrderFilters {
    status: OrderStatus | null;
    q: string | null;
    service: number | null;
    from: string | null; // "2026-10-01"
    to: string | null;
    payment: 'lunas' | 'belum' | null;
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
    helpdeskUnread?: number; // pesan helpdesk belum dibaca
    notificationsUnread?: number; // notifikasi lonceng belum dibaca
}

/** Satu notifikasi di lonceng (NotificationService::listFor). */
export interface AppNotification {
    id: string;
    kind: 'order' | 'payment' | 'helpdesk' | 'security';
    title: string;
    body: string;
    url: string;
    read: boolean;
    created_at: string;
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

/** Pesan helpdesk (HelpdeskMessage::toChat). */
export interface ChatMessage {
    id: number;
    body: string | null; // null jika pesan dihapus / hanya lampiran
    from_admin: boolean;
    created_at: string;
    edited: boolean;
    deleted: boolean;
    editable_until: string | null; // batas waktu edit (server tetap memvalidasi)
    deletable_until: string | null;
    attachment: { name: string; mime: string; size: number; image: boolean; url: string } | null;
}

/** Ringkasan percakapan di daftar admin (HelpdeskService::adminThreads). */
export interface HelpdeskThreadSummary {
    id: number;
    user: Pick<User, 'id' | 'name' | 'email' | 'avatar_url'>;
    last_message: { body: string; from_admin: boolean; created_at: string } | null;
    unread_count: number;
}

/** Pilihan periode halaman Laporan (ReportRequest::forView). */
export type ReportRange = '7d' | '30d' | '90d' | 'month' | 'year' | 'custom';

export interface ReportFilters {
    range: ReportRange;
    from: string; // "2026-10-01"
    to: string;
}

/** Angka ringkasan + pembanding dengan periode sebelumnya (delta = persen, null jika sebelumnya 0). */
export interface ReportMetric {
    value: number;
    previous: number;
    delta: number | null;
}

/** Data halaman Laporan (ReportService::build). */
export interface Report {
    summary: {
        revenue: ReportMetric;
        orders: ReportMetric;
        completed: ReportMetric;
        rating: { value: number | null; count: number; previous: number | null };
    };
    granularity: 'day' | 'month';
    revenueSeries: { key: string; value: number; count: number }[];
    ordersSeries: { key: string; value: number }[];
    byService: { name: string; orders: number; revenue: number }[];
    byMethod: { name: string; count: number; revenue: number }[];
    byStatus: { name: string; value: number }[];
    previousPeriod: { from: string; to: string };
}
