import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ChartCard from './ChartCard';

describe('ChartCard', () => {
    it('menampilkan grafik lebih dulu, dan tabel setelah tombol Tabel ditekan', () => {
        render(<ChartCard title="Pendapatan" chart={<p>ISI GRAFIK</p>} table={<p>ISI TABEL</p>} />);

        expect(screen.getByText('ISI GRAFIK')).toBeTruthy();
        expect(screen.queryByText('ISI TABEL')).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: /Tabel/ }));
        expect(screen.getByText('ISI TABEL')).toBeTruthy();
        expect(screen.queryByText('ISI GRAFIK')).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: /Grafik/ }));
        expect(screen.getByText('ISI GRAFIK')).toBeTruthy();
    });

    it('menandai tampilan aktif untuk pembaca layar', () => {
        render(<ChartCard title="Pendapatan" chart={<p>g</p>} table={<p>t</p>} />);

        expect(screen.getByRole('button', { name: /Grafik/ }).getAttribute('aria-pressed')).toBe('true');
        expect(screen.getByRole('button', { name: /Tabel/ }).getAttribute('aria-pressed')).toBe('false');
    });

    it('grafik berbentuk fungsi bisa memindahkan kartu ke tabel', () => {
        render(<ChartCard title="Per layanan" chart={(showTable) => <button onClick={showTable}>lihat semua</button>} table={<p>ISI TABEL</p>} />);

        fireEvent.click(screen.getByText('lihat semua'));

        expect(screen.getByText('ISI TABEL')).toBeTruthy();
    });

    it('tinggi tetap membuat isi kartu tidak memanjang, tabel di-scroll di dalamnya', () => {
        const { container } = render(<ChartCard title="Per layanan" bodyHeight="16rem" chart={<p>g</p>} table={<p>t</p>} />);

        const body = container.querySelector('section > div:last-child') as HTMLElement;
        expect(body.style.height).toBe('16rem');

        fireEvent.click(screen.getByRole('button', { name: /Tabel/ }));
        expect(container.querySelector('.overflow-auto')).not.toBeNull();
    });
});
