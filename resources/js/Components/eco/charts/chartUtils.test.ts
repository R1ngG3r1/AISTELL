import { describe, expect, it } from 'vitest';
import { axisLabel, compact, fullLabel, niceCeil, parseKey, tickIndexes } from './chartUtils';

/** Intl menyisipkan spasi non-breaking (U+00A0) antara angka dan satuan; disamakan dengan spasi biasa. */
const plain = (s: string) => s.replaceAll('\u00a0', ' ');

describe('compact', () => {
    it('meringkas angka besar gaya Indonesia', () => {
        expect(plain(compact(0))).toBe('0');
        expect(plain(compact(500000))).toBe('500 rb');
        expect(plain(compact(1500000))).toBe('1,5 jt');
    });
});

describe('niceCeil', () => {
    it.each([
        [0, 4],
        [-5, 4],
        [1, 1],
        [1.2, 2],
        [2.2, 2.5],
        [3, 5],
        [7, 10],
        [973000, 1000000],
        [4710000, 5000000],
        [0.3, 0.5],
    ])('%s dibulatkan ke atas menjadi %s', (value, expected) => {
        expect(niceCeil(value)).toBeCloseTo(expected);
    });

    it('selalu >= nilai aslinya', () => {
        for (const v of [0.01, 1, 9, 11, 99, 101, 12345, 987654321]) {
            expect(niceCeil(v)).toBeGreaterThanOrEqual(v);
        }
    });
});

describe('parseKey', () => {
    it('membaca kunci harian sebagai tanggal lokal', () => {
        const d = parseKey('2026-10-05');
        expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 9, 5]);
    });

    it('kunci bulanan jatuh ke tanggal 1', () => {
        const d = parseKey('2026-10');
        expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 9, 1]);
    });
});

describe('label tanggal', () => {
    it('label sumbu pendek', () => {
        expect(axisLabel('2026-10-05', 'day')).toBe('5 Okt');
        expect(axisLabel('2026-10', 'month')).toBe('Okt 26');
    });

    it('label lengkap untuk tooltip dan tabel', () => {
        expect(fullLabel('2026-10-05', 'day')).toBe('Senin, 5 Oktober 2026');
        expect(fullLabel('2026-10', 'month')).toBe('Oktober 2026');
    });
});

describe('tickIndexes', () => {
    it('menampilkan semua bila muat', () => {
        expect(tickIndexes(5, 7)).toEqual([0, 1, 2, 3, 4]);
        expect(tickIndexes(0, 7)).toEqual([]);
    });

    it('memilih label tersebar, selalu termasuk yang pertama dan terakhir', () => {
        const ticks = tickIndexes(30, 6);

        expect(ticks).toHaveLength(6);
        expect(ticks[0]).toBe(0);
        expect(ticks[ticks.length - 1]).toBe(29);
        expect([...ticks].sort((a, b) => a - b)).toEqual(ticks);
        expect(new Set(ticks).size).toBe(6);
    });
});
