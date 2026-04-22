import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock IntersectionObserver
class IntersectionObserverMock {
  constructor() {}
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
}

window.IntersectionObserver = vi.fn().mockImplementation(() => new IntersectionObserverMock());

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock requestAnimationFrame to prevent recursion errors in JSDOM
window.requestAnimationFrame = vi.fn().mockImplementation((cb) => {
  return setTimeout(cb, 0);
});
window.cancelAnimationFrame = vi.fn().mockImplementation((id) => {
  clearTimeout(id);
});
