import { describe, expect, it } from 'vitest';
import { formatDate, formatRupiah, formatTime, orderPrice } from './format';

describe('formatRupiah', () => {
    it('memakai pemisah ribuan titik tanpa desimal', () => {
        expect(formatRupiah(150000)).toMatch(/^Rp\s?150\.000$/);
        expect(formatRupiah('8440000.00')).toMatch(/^Rp\s?8\.440\.000$/);
    });

    it('menangani nol', () => {
        expect(formatRupiah(0)).toMatch(/^Rp\s?0$/);
    });
});

describe('formatDate', () => {
    it('menulis tanggal panjang bahasa Indonesia', () => {
        expect(formatDate('2026-10-05')).toBe('5 Oktober 2026');
    });
});

describe('formatTime', () => {
    it('memotong detik dan menambah zona WIB', () => {
        expect(formatTime('09:00:00')).toBe('09:00 WIB');
        expect(formatTime('13:30')).toBe('13:30 WIB');
    });
});

describe('orderPrice', () => {
    it('memakai harga yang dikunci pada pesanan', () => {
        expect(orderPrice({ price: '100000.00', service: { id: 1, name: 'x', price: '150000.00' } })).toBe('100000.00');
    });

    it('jatuh ke harga layanan untuk data lama tanpa kolom harga', () => {
        expect(orderPrice({ price: null, service: { id: 1, name: 'x', price: '150000.00' } })).toBe('150000.00');
    });

    it('null bila tidak ada keduanya', () => {
        expect(orderPrice({ price: null, service: undefined })).toBeNull();
    });
});
