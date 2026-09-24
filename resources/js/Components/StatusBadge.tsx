import { Order, OrderStatus } from '@/types';

const styles: Record<OrderStatus, { badge: string; dot: string }> = {
    menunggu: { badge: 'bg-sun-100 text-sun-600 ring-sun-400/30', dot: 'bg-sun-400 animate-pulse' },
    diproses: { badge: 'bg-forest-50 text-forest-600 ring-forest-400/30', dot: 'bg-forest-500 animate-pulse' },
    selesai: { badge: 'bg-leaf-100 text-leaf-600 ring-leaf-500/30', dot: 'bg-leaf-500' },
    ditolak: { badge: 'bg-clay-100 text-clay-600 ring-clay-500/30', dot: 'bg-clay-500' },
    dibatalkan: { badge: 'bg-sand-200 text-forest-900/55 ring-forest-900/10', dot: 'bg-forest-900/30' },
};

export default function StatusBadge({
    order,
    className = '',
}: {
    order: Pick<Order, 'status' | 'status_label'>;
    className?: string;
}) {
    const s = styles[order.status];
    return (
        <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${s.badge} ${className}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {order.status_label}
        </span>
    );
}
