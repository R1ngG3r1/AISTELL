import { Order } from '@/types';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Tombol unduh invoice PDF. Hanya muncul setelah pembayaran lunas (backend juga
 * menolak dengan 404 selain itu). Memakai <a> biasa, bukan Inertia, karena responsnya berkas.
 */
export default function InvoiceButton({ order, className = '' }: { order: Pick<Order, 'id' | 'payment'>; className?: string }) {
    if (order.payment?.status !== 'lunas') return null;

    return (
        <a href={route('orders.invoice', order.id)} download className={`btn-ghost w-full ${className}`}>
            <FontAwesomeIcon icon={faFilePdf} /> Unduh invoice (PDF)
        </a>
    );
}
