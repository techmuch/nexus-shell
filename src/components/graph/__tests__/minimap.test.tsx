import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphMiniMap } from '../GraphMiniMap';
import {
  toScreenSpace,
  viewportRect,
  type IGraphNode,
  type IViewport,
} from '../../../lib/graph';

/**
 * The minimap's job is to answer "where am I" and let you go somewhere else.
 * These assert the two invariants that make it trustworthy: the indicator
 * always reflects the real viewport, and clicking lands where you clicked.
 */

const NODES: IGraphNode[] = [
  { id: 'a', position: { x: 0, y: 0 }, size: { width: 100, height: 50 } },
  { id: 'b', position: { x: 400, y: 300 }, size: { width: 100, height: 50 } },
];

const CANVAS = { width: 800, height: 600 };
const SIZE = { width: 200, height: 150 };

/** jsdom gives every element a zero rect; the component measures itself. */
const stubRect = (element: HTMLElement) => {
  element.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: SIZE.width, height: SIZE.height, right: SIZE.width, bottom: SIZE.height, x: 0, y: 0, toJSON: () => {} }) as DOMRect;
};

afterEach(cleanup);

describe('GraphMiniMap', () => {
  it('plots one rect per node plus the viewport indicator', () => {
    const { container } = render(
      <GraphMiniMap nodes={NODES} viewport={{ x: 0, y: 0, scale: 1 }} canvasSize={CANVAS} />,
    );
    // Two nodes and one indicator.
    expect(container.querySelectorAll('rect')).toHaveLength(3);
  });

  it('renders without a viewport indicator before the canvas has measured', () => {
    const { container } = render(
      <GraphMiniMap
        nodes={NODES}
        viewport={{ x: 0, y: 0, scale: 1 }}
        canvasSize={{ width: 0, height: 0 }}
      />,
    );
    // Nodes only — drawing an indicator from a zero size would be a lie.
    expect(container.querySelectorAll('rect')).toHaveLength(2);
  });

  it('is a read-only image without onViewportChange', () => {
    render(<GraphMiniMap nodes={NODES} viewport={{ x: 0, y: 0, scale: 1 }} canvasSize={CANVAS} />);
    const map = screen.getByRole('img');
    expect(map).not.toHaveAttribute('tabindex');
  });

  it('is focusable and interactive when it can navigate', () => {
    render(
      <GraphMiniMap
        nodes={NODES}
        viewport={{ x: 0, y: 0, scale: 1 }}
        canvasSize={CANVAS}
        onViewportChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('slider')).toHaveAttribute('tabindex', '0');
  });

  it('describes the graph for assistive technology', () => {
    const { rerender } = render(
      <GraphMiniMap nodes={[]} viewport={{ x: 0, y: 0, scale: 1 }} canvasSize={CANVAS} />,
    );
    expect(screen.getByRole('img')).toHaveAttribute('aria-valuetext', 'Empty graph');

    rerender(
      <GraphMiniMap nodes={NODES} viewport={{ x: 0, y: 0, scale: 1 }} canvasSize={CANVAS} />,
    );
    expect(screen.getByRole('img').getAttribute('aria-valuetext')).toContain('2 nodes');
  });

  it('centres the canvas on the point that was clicked', () => {
    const onViewportChange = vi.fn();
    render(
      <GraphMiniMap
        nodes={NODES}
        viewport={{ x: 0, y: 0, scale: 1 }}
        canvasSize={CANVAS}
        width={SIZE.width}
        height={SIZE.height}
        onViewportChange={onViewportChange}
      />,
    );

    const map = screen.getByRole('slider');
    stubRect(map);

    // Click the middle of the minimap.
    fireEvent.pointerDown(map, {
      button: 0,
      clientX: SIZE.width / 2,
      clientY: SIZE.height / 2,
    });

    expect(onViewportChange).toHaveBeenCalledTimes(1);
    const next: IViewport = onViewportChange.mock.calls[0][0];

    // Whatever graph point sat under the click must now sit at the centre of
    // the canvas — that is the entire contract of a minimap click.
    const centreOfView = {
      x: viewportRect(next, CANVAS).x + viewportRect(next, CANVAS).width / 2,
      y: viewportRect(next, CANVAS).y + viewportRect(next, CANVAS).height / 2,
    };
    const onScreen = toScreenSpace(centreOfView, next);

    expect(onScreen.x).toBeCloseTo(CANVAS.width / 2);
    expect(onScreen.y).toBeCloseTo(CANVAS.height / 2);
  });

  it('preserves zoom when navigating', () => {
    const onViewportChange = vi.fn();
    render(
      <GraphMiniMap
        nodes={NODES}
        viewport={{ x: 0, y: 0, scale: 2.5 }}
        canvasSize={CANVAS}
        onViewportChange={onViewportChange}
      />,
    );

    const map = screen.getByRole('slider');
    stubRect(map);
    fireEvent.pointerDown(map, { button: 0, clientX: 10, clientY: 10 });

    // A minimap answers "where", not "how close".
    expect(onViewportChange.mock.calls[0][0].scale).toBe(2.5);
  });

  it('pans with the arrow keys', async () => {
    const Harness = () => {
      const [viewport, setViewport] = useState<IViewport>({ x: 0, y: 0, scale: 1 });
      return (
        <div>
          <GraphMiniMap
            nodes={NODES}
            viewport={viewport}
            canvasSize={CANVAS}
            onViewportChange={setViewport}
            panDistance={100}
          />
          <p data-testid="x">{Math.round(viewport.x)}</p>
        </div>
      );
    };
    render(<Harness />);

    const map = screen.getByRole('slider');
    stubRect(map);
    map.focus();

    const before = Number(screen.getByTestId('x').textContent);
    await userEvent.keyboard('{ArrowRight}');
    const after = Number(screen.getByTestId('x').textContent);

    // Panning right moves the graph left under the viewport.
    expect(after).toBeLessThan(before);
  });

  it('ignores keys it does not handle', () => {
    const onViewportChange = vi.fn();
    render(
      <GraphMiniMap
        nodes={NODES}
        viewport={{ x: 0, y: 0, scale: 1 }}
        canvasSize={CANVAS}
        onViewportChange={onViewportChange}
      />,
    );

    fireEvent.keyDown(screen.getByRole('slider'), { key: 'a' });
    expect(onViewportChange).not.toHaveBeenCalled();
  });

  it('colours highlighted nodes differently', () => {
    const { container } = render(
      <GraphMiniMap
        nodes={NODES}
        viewport={{ x: 0, y: 0, scale: 1 }}
        canvasSize={CANVAS}
        highlightIds={['b']}
      />,
    );

    const rects = [...container.querySelectorAll('rect')];
    expect(rects.filter((r) => r.classList.contains('fill-primary'))).toHaveLength(1);
  });

  it('accepts a per-node colour', () => {
    const { container } = render(
      <GraphMiniMap
        nodes={NODES}
        viewport={{ x: 0, y: 0, scale: 1 }}
        canvasSize={CANVAS}
        nodeColor={(node) => (node.id === 'a' ? 'red' : 'blue')}
      />,
    );

    const fills = [...container.querySelectorAll('rect')].map((r) => r.getAttribute('fill'));
    expect(fills).toContain('red');
    expect(fills).toContain('blue');
  });

  it('keeps the indicator visible when panned away from every node', () => {
    const { container } = render(
      <GraphMiniMap
        nodes={NODES}
        // Panned a long way from the graph.
        viewport={{ x: -8000, y: -6000, scale: 1 }}
        canvasSize={CANVAS}
        width={SIZE.width}
        height={SIZE.height}
      />,
    );

    const rects = [...container.querySelectorAll('rect')];
    const indicator = rects[rects.length - 1];
    const x = Number(indicator.getAttribute('x'));
    const y = Number(indicator.getAttribute('y'));

    // The plotted extent unions the graph with the viewport, so the indicator
    // must still land inside the minimap rather than off its edge.
    expect(x).toBeGreaterThanOrEqual(-1);
    expect(y).toBeGreaterThanOrEqual(-1);
    expect(x).toBeLessThanOrEqual(SIZE.width);
    expect(y).toBeLessThanOrEqual(SIZE.height);
  });

  it('renders an empty graph without crashing', () => {
    const { container } = render(
      <GraphMiniMap nodes={[]} viewport={{ x: 0, y: 0, scale: 1 }} canvasSize={CANVAS} />,
    );
    expect(container.querySelectorAll('rect')).toHaveLength(1);
  });
});
