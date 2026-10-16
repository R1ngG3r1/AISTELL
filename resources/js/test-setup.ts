import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom tidak punya ResizeObserver (dipakai grafik); cukup versi kosong karena ukuran jatuh ke nilai bawaan.
class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub;

afterEach(() => cleanup());
