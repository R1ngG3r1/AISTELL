import { Order } from '@/types';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faBan, faCheck, faHourglassHalf, faPaperPlane, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type Step = { label: string; icon: IconDefinition; state: 'done' | 'active' | 'pending' | 'failed' };

/** Progres pesanan: Dikirim → Diproses → Selesai, atau berakhir di Ditolak/Dibatalkan. */
export default function OrderTimeline({ order }: { order: Pick<Order, 'status'> }) {
    let steps: Step[];

    if (order.status === 'ditolak' || order.status === 'dibatalkan') {
        steps = [
            { label: 'Dikirim', icon: faPaperPlane, state: 'done' },
            {
                label: order.status === 'ditolak' ? 'Ditolak' : 'Dibatalkan',
                icon: order.status === 'ditolak' ? faXmark : faBan,
                state: 'failed',
            },
        ];
    } else {
        // Posisi status saat ini: 0 = menunggu, 1 = diproses, 2 = selesai
        const at = { menunggu: 0, diproses: 1, selesai: 2 }[order.status];
        const state = (i: number): Step['state'] =>
            i < at || order.status === 'selesai' ? 'done' : i === at ? 'active' : 'pending';
        steps = [
            { label: order.status === 'menunggu' ? 'Menunggu' : 'Dikirim', icon: faPaperPlane, state: state(0) },
            { label: 'Diproses', icon: faHourglassHalf, state: state(1) },
            { label: 'Selesai', icon: faCheck, state: state(2) },
        ];
    }

    const circle: Record<Step['state'], string> = {
        done: 'bg-forest-900 text-leaf-400',
        active: 'bg-leaf-300 text-forest-900 ring-4 ring-leaf-300/40',
        pending: 'bg-sand-200 text-forest-900/30',
        failed: 'bg-clay-500 text-white ring-4 ring-clay-500/20',
    };

    return (
        <ol className="flex items-start">
            {steps.map((step, i) => {
                const next = steps[i + 1];
                const lineFilled = next && next.state !== 'pending';
                return (
                    <li key={step.label} className={`flex flex-col ${next ? 'flex-1' : ''}`}>
                        <div className="flex items-center">
                            <span
                                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm transition ${circle[step.state]}`}
                            >
                                <FontAwesomeIcon icon={step.icon} className={step.state === 'active' ? 'animate-pulse' : ''} />
                            </span>
                            {next && (
                                <span className="mx-2 h-1 flex-1 overflow-hidden rounded-full bg-sand-200">
                                    {lineFilled && (
                                        <span
                                            className={`block h-full origin-left animate-grow rounded-full ${
                                                next.state === 'failed' ? 'bg-clay-500' : 'bg-forest-500'
                                            }`}
                                        />
                                    )}
                                </span>
                            )}
                        </div>
                        <span
                            className={`mt-2 w-11 whitespace-nowrap text-center text-xs font-semibold ${
                                step.state === 'failed'
                                    ? 'text-clay-600'
                                    : step.state === 'pending'
                                      ? 'text-forest-900/40'
                                      : 'text-forest-900'
                            }`}
                        >
                            <span className="-ml-4 inline-block w-[4.75rem]">{step.label}</span>
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}
