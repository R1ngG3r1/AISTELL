import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import BarList from './BarList';

const fmt = (v: number) => `Rp${v}`;
const rows = [
    { name: 'Bersih Rumah', value: 400, detail: '4 pesanan' },
    { name: 'Potong Rumput', value: 200, detail: '2 pesanan' },
    { name: 'Angkut Sampah', value: 100, detail: '1 pesanan' },
];

describe('BarList', () => {
    it('menampilkan nama dan nilai tiap baris', () => {
        render(<BarList rows={rows} format={fmt} />);

        expect(screen.getAllByRole('img')).toHaveLength(3);
        expect(screen.getByLabelText('Bersih Rumah: Rp400, 4 pesanan')).toBeTruthy();
        expect(screen.getByText('Rp200')).toBeTruthy();
    });

    it('menampilkan pesan kosong bila tidak ada baris', () => {
        render(<BarList rows={[]} format={fmt} empty="Belum ada pendapatan" />);

        expect(screen.getByText('Belum ada pendapatan')).toBeTruthy();
    });

    it('menampilkan pesan kosong bila semua nilai nol', () => {
        render(<BarList rows={rows.map((r) => ({ ...r, value: 0 }))} format={fmt} />);

        expect(screen.getByText('Belum ada data pada periode ini')).toBeTruthy();
        expect(screen.queryAllByRole('img')).toHaveLength(0);
    });

    it('membatasi jumlah baris agar kartu tidak memanjang, dan menawarkan sisanya', () => {
        const onShowAll = vi.fn();
        render(<BarList rows={rows} format={fmt} limit={2} onShowAll={onShowAll} />);

        expect(screen.getAllByRole('img')).toHaveLength(2);
        expect(screen.queryByLabelText(/Angkut Sampah/)).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: /\+1 lainnya/ }));
        expect(onShowAll).toHaveBeenCalledOnce();
    });

    it('tidak menampilkan tautan "lainnya" bila semua baris muat', () => {
        render(<BarList rows={rows} format={fmt} limit={5} onShowAll={() => {}} />);

        expect(screen.queryByRole('button')).toBeNull();
    });

    it('tooltip muncul saat fokus keyboard dan hilang saat blur', () => {
        render(<BarList rows={rows} format={fmt} />);
        const first = screen.getByLabelText(/Bersih Rumah/);

        fireEvent.focus(first);
        expect(screen.getByRole('status').textContent).toContain('4 pesanan');

        fireEvent.blur(first);
        expect(screen.queryByRole('status')).toBeNull();
    });

    it('nama dari data tidak dirender sebagai HTML', () => {
        render(<BarList rows={[{ name: '<img src=x onerror=alert(1)>', value: 5 }]} format={fmt} />);

        expect(document.querySelector('img[src="x"]')).toBeNull();
        expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeTruthy();
    });
});
