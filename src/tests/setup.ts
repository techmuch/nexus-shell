import '@testing-library/jest-dom'

class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] !== undefined ? this.store[key] : null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

const mockStorage = new LocalStorageMock();

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    configurable: true,
    writable: true,
  });
}

try {
  delete (globalThis as any).localStorage;
} catch (e) {}

Object.defineProperty(globalThis, 'localStorage', {
  value: mockStorage,
  configurable: true,
  writable: true,
});
