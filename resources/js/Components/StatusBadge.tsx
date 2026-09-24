import { statusColors } from '@/lib/format';
import { Order } from '@/types';

export default function StatusBadge({ order }: { order: Pick<Order, 'status' | 'status_label'> }) {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[order.status]}`}
        >
            {order.status_label}
        </span>
    );
}
