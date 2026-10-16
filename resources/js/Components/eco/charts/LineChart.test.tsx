import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LineChart, { LinePoint } from './LineChart';

const fmt = (v: number) => `Rp${v}`;
const data: LinePoint[] = [
    { key: '2026-10-01', value: 100, count: 1 },
    { key: '2026-10-02', value: 900, count: 3 },
    { key: '2026-10-03', value: 400, count: 2 },
];

const setup = (points: LinePoint[] = data) =>
    render(<LineChart data={points} granularity="day" format={fmt} name="Pendapatan" countLabel={(n) => `${n} transaksi`} />);

describe('LineChart', () => {
    it('ringkasan untuk pembaca layar menyebut total dan titik tertinggi', () => {
        setup();

        const label = screen.getByRole('group').getAttribute('aria-label') ?? '';
        expect(label).toContain('total Rp1400');
        expect(label).toContain('tertinggi Rp900');
        expect(label).toContain('Jumat, 2 Oktober 2026');
    });

    it('menggambar satu garis dan satu label pada titik tertinggi', () => {
        const { container } = setup();

        expect(container.querySelectorAll('path[stroke]')).toHaveLength(1);
        expect(screen.getByText('900')).toBeTruthy(); // label puncak (ringkas)
    });

    it('seri kosong menampilkan pesan, tanpa garis', () => {
        const { container } = setup(data.map((d) => ({ ...d, value: 0 })));

        expect(screen.getByText('Belum ada data pada periode ini')).toBeTruthy();
        expect(container.querySelectorAll('path[stroke]')).toHaveLength(0);
        expect(screen.getByRole('group').getAttribute('aria-label')).toContain('tidak ada data');
    });

    it('tidak error untuk data kosong atau satu titik', () => {
        expect(() => setup([])).not.toThrow();
        expect(() => setup([{ key: '2026-10-01', value: 5 }])).not.toThrow();
    });

    describe('navigasi keyboard', () => {
        it('fokus menampilkan tooltip titik terakhir', () => {
            setup();

            fireEvent.focus(screen.getByRole('group'));

            const tip = screen.getByRole('status').textContent ?? '';
            expect(tip).toContain('Sabtu, 3 Oktober 2026');
            expect(tip).toContain('Rp400');
            expect(tip).toContain('2 transaksi');
        });

        it('panah kiri/kanan, Home, End berpindah titik', () => {
            setup();
            const chart = screen.getByRole('group');
            fireEvent.focus(chart);

            fireEvent.keyDown(chart, { key: 'ArrowLeft' });
            expect(screen.getByRole('status').textContent).toContain('Rp900');

            fireEvent.keyDown(chart, { key: 'Home' });
            expect(screen.getByRole('status').textContent).toContain('Rp100');

            fireEvent.keyDown(chart, { key: 'ArrowRight' });
            expect(screen.getByRole('status').textContent).toContain('Rp900');

            fireEvent.keyDown(chart, { key: 'End' });
            expect(screen.getByRole('status').textContent).toContain('Rp400');
        });

        it('tidak keluar dari batas data', () => {
            setup();
            const chart = screen.getByRole('group');
            fireEvent.focus(chart);

            fireEvent.keyDown(chart, { key: 'ArrowRight' });
            expect(screen.getByRole('status').textContent).toContain('Rp400');

            fireEvent.keyDown(chart, { key: 'Home' });
            fireEvent.keyDown(chart, { key: 'ArrowLeft' });
            expect(screen.getByRole('status').textContent).toContain('Rp100');
        });

        it('Escape dan blur menutup tooltip', () => {
            setup();
            const chart = screen.getByRole('group');
            fireEvent.focus(chart);

            fireEvent.keyDown(chart, { key: 'Escape' });
            expect(screen.queryByRole('status')).toBeNull();

            fireEvent.focus(chart);
            fireEvent.keyDown(chart, { key: 'Home' });
            fireEvent.blur(chart);
            expect(screen.queryByRole('status')).toBeNull();
        });
    });
});
