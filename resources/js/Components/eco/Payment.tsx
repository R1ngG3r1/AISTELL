import { METHOD_BRAND, PAYMENT_STATUS_STYLE } from '@/lib/payment';
import { Payment } from '@/types';

/** Logo metode pembayaran: kotak berwarna khas + singkatan. */
export function MethodLogo({ method, className = 'h-9 w-14 text-[11px]' }: { method: string; className?: string }) {
    const b = METHOD_BRAND[method] ?? { short: method.toUpperCase(), bg: '#eef6f1', fg: '#072d23' };
    return (
        <span
            className={`grid shrink-0 place-items-center rounded-lg font-display font-extrabold tracking-tight ring-1 ring-forest-900/10 ${className}`}
            style={{ backgroundColor: b.bg, color: b.fg }}
        >
            {b.short}
        </span>
    );
}

/** Badge status pembayaran. Tanpa pembayaran → "Belum dibayar". */
export function PaymentBadge({ payment, className = '' }: { payment?: Payment | null; className?: string }) {
    const style = payment ? PAYMENT_STATUS_STYLE[payment.status] : 'bg-clay-100 text-clay-600 ring-clay-500/30';
    // Tunai yang belum dibayar ditampilkan sebagai "Bayar di tempat", bukan "Menunggu pembayaran".
    const label = !payment
        ? 'Belum dibayar'
        : payment.status === 'menunggu' && payment.method_group === 'cod'
          ? 'Bayar di tempat'
          : payment.status_label;
    return (
        <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${style} ${className}`}>
            {label}
        </span>
    );
}
