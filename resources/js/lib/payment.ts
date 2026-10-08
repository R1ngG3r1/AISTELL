// Data tampilan metode pembayaran (DUMMY): warna logo, nama aplikasi, dan langkah pembayaran.
import { Payment, PaymentGroup, PaymentStatus } from '@/types';

export const GROUP_LABELS: Record<PaymentGroup, { title: string; hint: string }> = {
    qris: { title: 'QRIS', hint: 'Scan dari aplikasi bank atau e-wallet apa pun' },
    va: { title: 'Transfer Virtual Account', hint: 'Dicek otomatis, tanpa perlu kirim bukti transfer' },
    ewallet: { title: 'E-Wallet', hint: 'Bayar langsung dari aplikasi dompet digital' },
    retail: { title: 'Gerai Retail', hint: 'Bayar tunai di kasir minimarket terdekat' },
    cod: { title: 'Bayar di Tempat', hint: 'Bayar tunai ke petugas setelah layanan selesai' },
};

export const GROUP_ORDER: PaymentGroup[] = ['qris', 'va', 'ewallet', 'retail', 'cod'];

/** Logo sederhana (singkatan + warna khas) agar tidak bergantung pada file gambar merek. */
export const METHOD_BRAND: Record<string, { short: string; bg: string; fg: string; app?: string }> = {
    qris: { short: 'QRIS', bg: '#ffffff', fg: '#d6202f' },
    va_bca: { short: 'BCA', bg: '#0060af', fg: '#ffffff', app: 'BCA mobile / myBCA' },
    va_bni: { short: 'BNI', bg: '#f15a23', fg: '#ffffff', app: 'wondr by BNI' },
    va_bri: { short: 'BRI', bg: '#00529c', fg: '#ffffff', app: 'BRImo' },
    va_mandiri: { short: 'mandiri', bg: '#003d79', fg: '#ffb700', app: "Livin' by Mandiri" },
    va_permata: { short: 'Permata', bg: '#00a650', fg: '#ffffff', app: 'PermataMobile X' },
    va_bsi: { short: 'BSI', bg: '#00a39d', fg: '#ffffff', app: 'BSI Mobile' },
    gopay: { short: 'GoPay', bg: '#00aed6', fg: '#ffffff', app: 'Gojek' },
    ovo: { short: 'OVO', bg: '#4c3494', fg: '#ffffff', app: 'OVO' },
    dana: { short: 'DANA', bg: '#118eea', fg: '#ffffff', app: 'DANA' },
    shopeepay: { short: 'SPay', bg: '#ee4d2d', fg: '#ffffff', app: 'Shopee' },
    alfamart: { short: 'Alfa', bg: '#e31e24', fg: '#ffffff' },
    indomaret: { short: 'Indo', bg: '#0055a5', fg: '#ffd400' },
    cod: { short: 'Tunai', bg: '#072d23', fg: '#b4d96f' },
};

export const PAYMENT_STATUS_STYLE: Record<PaymentStatus, string> = {
    menunggu: 'bg-sun-100 text-sun-600 ring-sun-400/30',
    lunas: 'bg-leaf-100 text-leaf-600 ring-leaf-500/30',
    kedaluwarsa: 'bg-sand-200 text-forest-900/55 ring-forest-900/10',
    dibatalkan: 'bg-sand-200 text-forest-900/55 ring-forest-900/10',
    dikembalikan: 'bg-forest-50 text-forest-600 ring-forest-400/30',
};

/** "7001 2345 6789 0123" — nomor panjang dikelompokkan 4 digit agar mudah dibaca. */
export const groupDigits = (code: string) => code.replace(/(.{4})(?=.)/g, '$1 ');

/** Langkah pembayaran per channel, mis. { "ATM": [...], "Mobile Banking": [...] }. */
export function paymentSteps(payment: Payment): Record<string, string[]> {
    const brand = METHOD_BRAND[payment.method];
    const bank = payment.method_label.replace(' Virtual Account', '');

    switch (payment.method_group) {
        case 'qris':
            return {
                'Cara bayar': [
                    'Buka aplikasi m-banking atau e-wallet yang mendukung QRIS (GoPay, OVO, DANA, ShopeePay, BCA mobile, BRImo, dll.).',
                    'Pilih menu Scan / Bayar QRIS.',
                    'Scan kode QR di halaman ini, atau unduh lalu unggah gambarnya dari galeri.',
                    'Pastikan nama merchant AISTEL dan nominal sudah sesuai, lalu konfirmasi dengan PIN.',
                    'Pembayaran terverifikasi otomatis dalam beberapa detik.',
                ],
            };
        case 'va':
            return {
                'Mobile Banking': [
                    `Buka aplikasi ${brand?.app ?? bank} lalu login.`,
                    'Pilih menu Transfer / Bayar → Virtual Account.',
                    'Masukkan nomor Virtual Account di atas.',
                    'Periksa nama tagihan AISTEL dan nominal, lalu konfirmasi dengan PIN.',
                ],
                ATM: [
                    `Masukkan kartu ATM ${bank} dan PIN.`,
                    'Pilih Transaksi Lainnya → Transfer → Virtual Account.',
                    'Masukkan nomor Virtual Account di atas, lalu tekan Benar.',
                    'Periksa detail tagihan, lalu pilih Ya untuk membayar. Simpan struk.',
                ],
                'Internet Banking': [
                    `Login ke internet banking ${bank}.`,
                    'Pilih menu Pembayaran → Virtual Account.',
                    'Masukkan nomor Virtual Account, lalu lanjutkan.',
                    'Konfirmasi dengan token / OTP.',
                ],
            };
        case 'ewallet':
            return {
                'Cara bayar': [
                    `Buka aplikasi ${brand?.app ?? payment.method_label}.`,
                    'Pilih menu Bayar / Scan.',
                    'Scan kode QR di halaman ini.',
                    `Pastikan nominal sesuai, lalu konfirmasi dengan PIN ${payment.method_label}.`,
                ],
            };
        case 'retail':
            return {
                'Cara bayar': [
                    `Datang ke gerai ${payment.method_label} terdekat.`,
                    'Sampaikan ke kasir ingin membayar tagihan AISTEL.',
                    'Tunjukkan kode pembayaran di atas.',
                    'Bayar sesuai total tagihan dan simpan struk sebagai bukti.',
                ],
            };
        default:
            return {
                'Cara bayar': [
                    'Petugas datang sesuai jadwal dan mengerjakan layanan.',
                    'Setelah layanan selesai, bayar tunai sesuai total tagihan ke petugas.',
                    'Status pembayaran otomatis menjadi Lunas saat admin menandai pesanan selesai.',
                ],
            };
    }
}
