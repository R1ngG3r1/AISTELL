import StatusBadge from '@/Components/StatusBadge';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { GROUP_ORDER, groupDigits, METHOD_BRAND, PAYMENT_STATUS_STYLE } from './payment';

/*
| "Contract test": backend (enum PHP) dan frontend (peta tampilan) harus selaras. Bila backend
| menambah metode pembayaran atau status baru tetapi frontend lupa, test ini gagal di CI,
| bukan pengguna yang menemukan logo kosong atau halaman error.
*/

/** Ambil pasangan `case Nama = 'nilai'` dari sebuah enum PHP. */
function phpEnum(path: string): { name: string; value: string }[] {
    const source = readFileSync(resolve(process.cwd(), path), 'utf8');

    return [...source.matchAll(/case\s+(\w+)\s*=\s*'([^']+)'/g)].map((m) => ({ name: m[1], value: m[2] }));
}

describe('metode pembayaran', () => {
    const methods = phpEnum('app/Modules/Payment/Enums/PaymentMethod.php').map((c) => c.value);

    it('terbaca dari enum PHP', () => {
        expect(methods.length).toBeGreaterThan(10);
        expect(methods).toContain('qris');
    });

    it.each(methods)('%s punya logo dan warna di frontend', (method) => {
        expect(METHOD_BRAND[method], `METHOD_BRAND belum memuat "${method}"`).toBeDefined();
        expect(METHOD_BRAND[method].short).not.toBe('');
    });

    it('frontend tidak memuat metode yang sudah dihapus di backend', () => {
        expect(Object.keys(METHOD_BRAND).sort()).toEqual([...methods].sort());
    });
});

describe('status pembayaran', () => {
    const statuses = phpEnum('app/Modules/Payment/Enums/PaymentStatus.php').map((c) => c.value);

    it('setiap status backend punya gaya di frontend dan sebaliknya', () => {
        expect(Object.keys(PAYMENT_STATUS_STYLE).sort()).toEqual([...statuses].sort());
    });
});

describe('status pesanan', () => {
    const statuses = phpEnum('app/Modules/Order/Enums/OrderStatus.php');

    it.each(statuses)('StatusBadge dapat menampilkan "$value"', ({ value }) => {
        // `as never`: nilai berasal dari PHP sehingga tipenya sengaja tidak diketahui compiler.
        render(<StatusBadge order={{ status: value as never, status_label: `Label ${value}` }} />);

        expect(screen.getByText(`Label ${value}`)).toBeTruthy();
    });
});

describe('grup pembayaran', () => {
    it('urutan grup di frontend memuat semua grup yang dipakai metode', () => {
        const source = readFileSync(resolve(process.cwd(), 'app/Modules/Payment/Enums/PaymentMethod.php'), 'utf8');
        const groups = [...source.matchAll(/=>\s*'(qris|va|ewallet|retail|cod)'/g)].map((m) => m[1]);

        expect(new Set(groups)).toEqual(new Set(GROUP_ORDER));
    });
});

describe('groupDigits', () => {
    it('mengelompokkan nomor panjang per 4 digit', () => {
        expect(groupDigits('7001234567890123')).toBe('7001 2345 6789 0123');
        expect(groupDigits('12345')).toBe('1234 5');
        expect(groupDigits('123')).toBe('123');
    });
});
