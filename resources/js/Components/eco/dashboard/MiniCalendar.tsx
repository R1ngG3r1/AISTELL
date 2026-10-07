import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { dateKey, useServerClock } from '@/lib/live';
import { ScheduleDay } from '@/types';
import { useState } from 'react';

const dayNames = ['S', 'S', 'R', 'K', 'J', 'S', 'M']; // Senin → Minggu

const toKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * Kalender bulanan kecil. Tanggal yang ada di `schedule` (dari OrderService::schedule)
 * diberi penanda, beserta jumlah jadwal jika lebih dari satu.
 * "Hari ini" mengikuti jam server (WIB), bukan jam perangkat.
 */
export default function MiniCalendar({ schedule = [] }: { schedule?: ScheduleDay[] }) {
    const { now, timeZone } = useServerClock();
    const todayKey = dateKey(now, timeZone);
    const [ty, tm] = todayKey.split('-').map(Number);
    const [cursor, setCursor] = useState(new Date(ty, tm - 1, 1));
    const totals = new Map(schedule.map((d) => [d.date.slice(0, 10), d.total]));

    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const leading = (new Date(year, month, 1).getDay() + 6) % 7; // geser agar minggu dimulai Senin
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [
        ...Array.from({ length: leading }, () => null),
        ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
    ];

    const shift = (delta: number) => setCursor(new Date(year, month + delta, 1));

    return (
        <div>
            <div className="mb-3 flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => shift(-1)}
                    className="grid h-7 w-7 place-items-center rounded-full text-xs text-[#0c2b20]/50 transition hover:bg-[#eaf2e6] hover:text-[#287e59]"
                    aria-label="Bulan sebelumnya"
                >
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <span className="text-sm font-bold capitalize text-[#0c2b20]">
                    {cursor.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </span>
                <button
                    type="button"
                    onClick={() => shift(1)}
                    className="grid h-7 w-7 place-items-center rounded-full text-xs text-[#0c2b20]/50 transition hover:bg-[#eaf2e6] hover:text-[#287e59]"
                    aria-label="Bulan berikutnya"
                >
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
                {dayNames.map((d, i) => (
                    <span key={i} className="pb-1 font-bold text-[#0c2b20]/40">
                        {d}
                    </span>
                ))}
                {cells.map((date, i) => {
                    if (!date) return <span key={i} />;
                    const key = toKey(date);
                    const isToday = key === todayKey;
                    const total = totals.get(key) ?? 0;
                    const isMarked = total > 0;
                    return (
                        <span key={i} className="grid place-items-center">
                            <span
                                className={`relative grid h-8 w-8 place-items-center rounded-full font-semibold tabular-nums ${
                                    isToday
                                        ? 'bg-[#287e59] text-white shadow-soft'
                                        : isMarked
                                          ? 'bg-[#dcefe2] text-[#1e6244]'
                                          : 'text-[#0c2b20]/70'
                                }`}
                                title={isMarked ? `${total} jadwal layanan` : undefined}
                            >
                                {date.getDate()}
                                {isMarked &&
                                    (total > 1 ? (
                                        <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#07271e] px-1 text-[9px] font-bold text-[#4de097]">
                                            {total}
                                        </span>
                                    ) : (
                                        <span
                                            className={`absolute bottom-1 h-1 w-1 rounded-full ${isToday ? 'bg-white' : 'bg-[#287e59]'}`}
                                        />
                                    ))}
                            </span>
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
