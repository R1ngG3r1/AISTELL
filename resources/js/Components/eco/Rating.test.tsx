import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { RatingSummary, StarInput, Stars } from './Rating';

describe('Stars', () => {
    it('memberi label rating untuk pembaca layar', () => {
        render(<Stars value={4.5} />);

        expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Rating 4.5 dari 5');
    });
});

describe('RatingSummary', () => {
    it('menampilkan rata-rata dan jumlah ulasan', () => {
        render(<RatingSummary avg="4.5000" count={12} />);

        expect(screen.getByText('4,5')).toBeTruthy();
        expect(screen.getByText('(12 ulasan)')).toBeTruthy();
    });

    it.each([
        [{ avg: null, count: 5 }],
        [{ avg: '4.5', count: 0 }],
        [{ avg: undefined, count: undefined }],
    ])('tidak menampilkan apa pun bila belum ada ulasan: %j', (props) => {
        const { container } = render(<RatingSummary {...props} />);

        expect(container.innerHTML).toBe('');
    });
});

describe('StarInput', () => {
    function Harness({ onChange = () => {} }: { onChange?: (v: number) => void }) {
        const [value, setValue] = useState(0);
        return (
            <>
                <StarInput
                    value={value}
                    onChange={(v) => {
                        setValue(v);
                        onChange(v);
                    }}
                />
                <output data-testid="value">{value}</output>
            </>
        );
    }

    it('mengklik bintang memilih rating tersebut', () => {
        const onChange = vi.fn();
        render(<Harness onChange={onChange} />);

        fireEvent.click(screen.getByRole('radio', { name: '4 bintang' }));

        expect(onChange).toHaveBeenCalledWith(4);
        expect(screen.getByRole('radio', { name: '4 bintang' }).getAttribute('aria-checked')).toBe('true');
        expect(screen.getByRole('radio', { name: '3 bintang' }).getAttribute('aria-checked')).toBe('false');
    });

    it('panah mengubah rating dan dibatasi 1–5', () => {
        render(<Harness />);
        const first = screen.getByRole('radio', { name: '1 bintang' });

        fireEvent.keyDown(first, { key: 'ArrowRight' });
        expect(screen.getByTestId('value').textContent).toBe('1');

        for (let i = 0; i < 8; i++) fireEvent.keyDown(screen.getAllByRole('radio')[0], { key: 'ArrowRight' });
        expect(screen.getByTestId('value').textContent).toBe('5');

        for (let i = 0; i < 8; i++) fireEvent.keyDown(screen.getAllByRole('radio')[0], { key: 'ArrowLeft' });
        expect(screen.getByTestId('value').textContent).toBe('1');
    });

    it('hanya satu bintang yang bisa difokus dengan Tab (roving tabindex)', () => {
        render(<Harness />);

        const focusable = screen.getAllByRole('radio').filter((r) => r.getAttribute('tabindex') === '0');
        expect(focusable).toHaveLength(1);
    });

    it('menampilkan keterangan rating', () => {
        render(<Harness />);

        fireEvent.click(screen.getByRole('radio', { name: '5 bintang' }));

        expect(screen.getByText('Sangat bagus')).toBeTruthy();
    });
});
