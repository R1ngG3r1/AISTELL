import Avatar from '@/Components/eco/Avatar';
import ServiceIcon from '@/Components/eco/ServiceIcon';
import StatusBadge from '@/Components/StatusBadge';
import { formatDate, formatTime } from '@/lib/format';
import { Order } from '@/types';
import { faCalendarDays, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from '@inertiajs/react';

/**
 * Daftar pesanan admin versi kartu, untuk layar kecil (pengganti tabel yang
 * terlalu lebar di HP). Tampilkan dengan `md:hidden` berdampingan dengan tabelnya.
 */
export default function OrderCardList({ orders, className = '' }: { orders: Order[]; className?: string }) {
    return (
        <ul className={`divide-y divide-[#e6ece1] ${className}`}>
            {orders.map((o) => (
                <li key={o.id}>
                    <Link
                        href={route('admin.orders.show', o.id)}
                        className="flex items-center gap-3 px-5 py-4 transition hover:bg-[#eef4ea] active:bg-[#eef4ea]"
                    >
                        <Avatar name={o.contact_name} src={o.user?.avatar_url} className="h-10 w-10" />
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-sm font-bold">{o.contact_name}</p>
                                <span className="shrink-0 text-[11px] font-semibold text-[#0c2b20]/40">#{o.id}</span>
                            </div>
                            <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-[#0c2b20]/65">
                                <ServiceIcon name={o.service?.name ?? ''} className="text-[#287e59]" />
                                {o.service?.name}
                            </p>
                            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                                <span className="text-[11px] text-[#0c2b20]/50">
                                    <FontAwesomeIcon icon={faCalendarDays} className="me-1" />
                                    {formatDate(o.date)}, {formatTime(o.time)}
                                </span>
                                <StatusBadge order={o} />
                            </div>
                        </div>
                        <FontAwesomeIcon icon={faChevronRight} className="shrink-0 text-xs text-[#0c2b20]/25" />
                    </Link>
                </li>
            ))}
        </ul>
    );
}
