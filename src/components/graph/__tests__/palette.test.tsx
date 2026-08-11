import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NodePalette, readPaletteDrag, GRAPH_NODE_MIME } from '../NodePalette';

/**
 * Orientation is the interesting part: `auto` has to pick an axis from measured
 * space, and must not trap itself vertical by narrowing its own container.
 *
 * jsdom reports every box as zero, so the harness installs sizes before the
 * component measures — doing it afterwards makes the tests pass for the wrong
 * reason, since `auto` defaults to horizontal when it finds nothing to measure.
 */

const ITEMS = [
  { kind: 'service', label: 'Service' },
  { kind: 'queue', label: 'Queue' },
  { kind: 'gate', label: 'Gate' },
];

const ITEM_WIDTH = 90;
const ITEM_HEIGHT = 30;

/** The size the stand-in container reports. Tests set this before rendering. */
let containerSize = { width: 600, height: 400 };

/** Observer callbacks, so a test can simulate a resize. */
let observers: (() => void)[] = [];

const triggerResize = () => act(() => observers.forEach((cb) => cb()));

beforeEach(() => {
  containerSize = { width: 600, height: 400 };
  observers = [];

  // Item sizes.
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get(this: HTMLElement) {
      return this.hasAttribute('data-palette-item') ? ITEM_WIDTH : 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get(this: HTMLElement) {
      return this.hasAttribute('data-palette-item') ? ITEM_HEIGHT : 0;
    },
  });

  // Box sizes, resolved by element rather than assigned after the fact.
  Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
    configurable: true,
    value(this: Element) {
      const size =
        (this as HTMLElement).dataset?.testid === 'container'
          ? containerSize
          : { width: 0, height: 0 };
      return {
        ...size,
        left: 0,
        top: 0,
        right: size.width,
        bottom: size.height,
        x: 0,
        y: 0,
        toJSON: () => {},
      } as DOMRect;
    },
  });

  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
    constructor(private cb: () => void) {
      observers.push(cb);
    }
    observe() {
      this.cb();
    }
    unobserve() {}
    disconnect() {}
  };
});

afterEach(cleanup);

/** The palette inside a container of a known size — a sidebar or toolbar strip. */
const InContainer = (props: Partial<React.ComponentProps<typeof NodePalette>> = {}) => (
  <div data-testid="container">
    <NodePalette items={ITEMS} {...props} />
  </div>
);

const orientationOf = () => screen.getByRole('toolbar').getAttribute('data-orientation');

describe('explicit orientation', () => {
  it('renders a row when told to', () => {
    render(<NodePalette items={ITEMS} orientation="horizontal" />);
    const palette = screen.getByRole('toolbar');
    expect(palette).toHaveAttribute('data-orientation', 'horizontal');
    expect(palette).toHaveAttribute('aria-orientation', 'horizontal');
    expect(palette.className).toContain('flex-wrap');
  });

  it('renders a column when told to', () => {
    render(<NodePalette items={ITEMS} orientation="vertical" />);
    const palette = screen.getByRole('toolbar');
    expect(palette).toHaveAttribute('data-orientation', 'vertical');
    expect(palette).toHaveAttribute('aria-orientation', 'vertical');
    expect(palette.className).toContain('flex-col');
  });

  it('ignores available space when orientation is explicit', () => {
    // Far too narrow for a row, but `horizontal` was asked for.
    containerSize = { width: 40, height: 800 };
    render(<InContainer orientation="horizontal" />);
    expect(orientationOf()).toBe('horizontal');
  });
});

describe('auto orientation', () => {
  it('chooses a row when the items fit the width', () => {
    // 3 × 90 = 270 of buttons; 600 is ample.
    containerSize = { width: 600, height: 400 };
    render(<InContainer />);
    expect(orientationOf()).toBe('horizontal');
  });

  it('chooses a column when the row will not fit but the column will', () => {
    // Too narrow for 270px of buttons, tall enough for 90px of stacked ones.
    containerSize = { width: 120, height: 400 };
    render(<InContainer />);
    expect(orientationOf()).toBe('vertical');
  });

  it('falls back to a wrapping row when neither axis fits', () => {
    // Narrow and short: a column would overflow too, so wrap rather than run
    // off the bottom.
    containerSize = { width: 120, height: 40 };
    render(<InContainer />);
    expect(orientationOf()).toBe('horizontal');
    expect(screen.getByRole('toolbar').className).toContain('flex-wrap');
  });

  it('reports the axis it settled on, only when it changes', () => {
    const onOrientationChange = vi.fn();
    containerSize = { width: 120, height: 400 };
    render(<InContainer onOrientationChange={onOrientationChange} />);

    expect(onOrientationChange).toHaveBeenCalledWith('vertical');
    expect(onOrientationChange).toHaveBeenCalledTimes(1);

    // Measuring again with the same result must stay quiet.
    triggerResize();
    expect(onOrientationChange).toHaveBeenCalledTimes(1);
  });

  it('defaults to a row when there is nothing to measure against', () => {
    // No sized ancestor — an overlay that shrink-wraps the palette. Guessing
    // horizontal beats collapsing to a column for no reason.
    render(<NodePalette items={ITEMS} />);
    expect(orientationOf()).toBe('horizontal');
  });

  it('goes back to a row once its container has room again', () => {
    containerSize = { width: 120, height: 400 };
    render(<InContainer />);
    expect(orientationOf()).toBe('vertical');

    // Widen the container and let the observer fire. Because the palette
    // measures an ancestor with a size of its own rather than one that
    // shrink-wraps it, the extra room is visible — this is the case that would
    // otherwise trap it vertical forever.
    containerSize = { width: 600, height: 400 };
    triggerResize();

    expect(orientationOf()).toBe('horizontal');
  });

  it('re-measures when the item count changes', () => {
    containerSize = { width: 200, height: 400 };
    const { rerender } = render(<InContainer items={ITEMS.slice(0, 2)} />);
    // 2 × 90 = 180, fits 200.
    expect(orientationOf()).toBe('horizontal');

    // 3 × 90 = 270 no longer fits.
    rerender(<InContainer items={ITEMS} />);
    expect(orientationOf()).toBe('vertical');
  });
});

describe('items', () => {
  it('fires onSelect on click, so the palette works without a pointer drag', async () => {
    const onSelect = vi.fn();
    render(<NodePalette items={ITEMS} orientation="horizontal" onSelect={onSelect} />);

    await userEvent.click(screen.getByRole('button', { name: 'Service' }));
    expect(onSelect).toHaveBeenCalledWith(ITEMS[0]);
  });

  it('fires onSelect on Enter', async () => {
    const onSelect = vi.fn();
    render(<NodePalette items={ITEMS} orientation="horizontal" onSelect={onSelect} />);

    screen.getByRole('button', { name: 'Queue' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith(ITEMS[1]);
  });

  it('keeps an accessible name when only icons are shown', () => {
    render(<NodePalette items={ITEMS} orientation="vertical" iconOnly onSelect={() => {}} />);
    // The label is gone visually but not from the accessibility tree.
    expect(screen.getByRole('button', { name: 'Gate' })).toBeInTheDocument();
    expect(screen.queryByText('Gate')).not.toBeInTheDocument();
  });

  it('renders nothing but the toolbar when there are no items', () => {
    render(<NodePalette items={[]} orientation="horizontal" />);
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('puts the node kind on the drag', () => {
    const setData = vi.fn();
    render(<NodePalette items={ITEMS} orientation="horizontal" />);

    const button = screen.getByRole('button', { name: 'Service' });
    const event = new Event('dragstart', { bubbles: true });
    Object.defineProperty(event, 'dataTransfer', {
      value: { setData, effectAllowed: '' },
    });
    button.dispatchEvent(event);

    expect(setData).toHaveBeenCalledWith(GRAPH_NODE_MIME, 'service');
    // Plain text too, so a drop elsewhere degrades to something meaningful.
    expect(setData).toHaveBeenCalledWith('text/plain', 'Service');
  });
});

describe('readPaletteDrag', () => {
  const dragEvent = (data: Record<string, string>) =>
    ({ dataTransfer: { getData: (type: string) => data[type] ?? '' } }) as unknown as React.DragEvent;

  it('returns the kind a palette item put on the drag', () => {
    expect(readPaletteDrag(dragEvent({ [GRAPH_NODE_MIME]: 'service' }))).toBe('service');
  });

  it('returns null for a drag from somewhere else', () => {
    expect(readPaletteDrag(dragEvent({ 'text/plain': 'hello' }))).toBeNull();
  });
});
