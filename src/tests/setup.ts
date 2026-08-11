import '@testing-library/jest-dom'

/*
 * jsdom reports every element as 0x0 and has no ResizeObserver, so virtualised
 * components (TreeWidget, DataGrid — both built on react-virtuoso) measure an
 * empty viewport and render no rows. Giving elements a non-zero size and a
 * stub observer makes them testable.
 */

const SIZE = { offsetHeight: 800, offsetWidth: 800 } as const;

/**
 * react-virtuoso learns the viewport size from ResizeObserver callbacks, so a
 * no-op stub isn't enough — it has to actually report a size, synchronously on
 * observe.
 */
class ResizeObserverStub {
  constructor(private callback: ResizeObserverCallback) {}

  observe(target: Element) {
    const box = {
      inlineSize: SIZE.offsetWidth,
      blockSize: SIZE.offsetHeight,
    };
    this.callback(
      [
        {
          target,
          contentRect: target.getBoundingClientRect(),
          borderBoxSize: [box],
          contentBoxSize: [box],
          devicePixelContentBoxSize: [box],
        } as unknown as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver,
    );
  }

  unobserve() {}
  disconnect() {}
}

(globalThis as any).ResizeObserver = ResizeObserverStub;

for (const [prop, value] of Object.entries(SIZE)) {
  Object.defineProperty(HTMLElement.prototype, prop, {
    configurable: true,
    value,
  });
}

Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
  configurable: true,
  value: () => ({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: SIZE.offsetWidth,
    bottom: SIZE.offsetHeight,
    width: SIZE.offsetWidth,
    height: SIZE.offsetHeight,
    toJSON: () => {},
  }),
});

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
