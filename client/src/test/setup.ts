import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    addListener: () => undefined,
    dispatchEvent: () => false,
    removeEventListener: () => undefined,
    removeListener: () => undefined,
  }),
});

afterEach(() => {
  cleanup();
});
