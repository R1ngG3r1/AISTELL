import { StaffType } from '@/types';
import { faUser, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Penanda cara petugas turun ke lapangan. Hanya indikator: untuk tim, anggota tidak dicatat
 * dan nama petugas adalah penanggung jawabnya.
 */
export default function StaffTypeBadge({ type, className = '' }: { type: StaffType; className?: string }) {
    const team = type === 'tim';

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                team ? 'bg-sun-100 text-sun-600' : 'bg-forest-50 text-forest-600'
            } ${className}`}
        >
            <FontAwesomeIcon icon={team ? faUserGroup : faUser} />
            {team ? 'Tim' : 'Solo'}
        </span>
    );
}

/** Keterangan di bawah nama petugas, mis. "Penanggung jawab tim". */
export function staffRoleLabel(type: StaffType): string {
    return type === 'tim' ? 'Penanggung jawab tim' : 'Petugas solo';
}
