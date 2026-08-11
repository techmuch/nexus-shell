import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FREEFORM, useGraphLayout } from '../useGraphLayout';
import { layeredLayout, type GraphLayout } from '../../../lib/layout';
import type { IGraphEdge, IGraphNode, IPoint } from '../../../lib/graph';

/**
 * The interesting behaviour is the boundary between computed and hand-held
 * positions: an auto layout must never overwrite the arrangement you made, and
 * grabbing a node must always work rather than fighting the engine.
 */

const HAND_PLACED: IGraphNode[] = [
  { id: 'a', position: { x: 11, y: 22 }, size: { width: 100, height: 50 } },
  { id: 'b', position: { x: 33, y: 44 }, size: { width: 100, height: 50 } },
  { id: 'c', position: { x: 55, y: 66 }, size: { width: 100, height: 50 } },
];

const EDGES: IGraphEdge[] = [
  { id: 'e1', source: 'a', target: 'b' },
  { id: 'e2', source: 'b', target: 'c' },
];

interface HarnessProps {
  defaultMode?: string;
  layouts?: Record<string, GraphLayout>;
  escapeOnDrag?: boolean;
  onModeChange?: (mode: string) => void;
}

/** A small editor, close to what a consumer writes. */
const Harness = ({ defaultMode, layouts, escapeOnDrag, onModeChange }: HarnessProps) => {
  const [nodes, setNodes] = useState<IGraphNode[]>(HAND_PLACED);

  const layout = useGraphLayout({
    nodes,
    edges: EDGES,
    layouts,
    defaultMode,
    escapeOnDrag,
    onModeChange,
    onNodeMove: (id, position) =>
      setNodes((current) => current.map((n) => (n.id === id ? { ...n, position } : n))),
  });

  const drag = (id: string, position: IPoint) => layout.onMove(id, position);

  return (
    <div>
      <p data-testid="mode">{layout.mode}</p>
      <p data-testid="is-auto">{String(layout.isAuto)}</p>
      <p data-testid="available">{layout.available.join(',')}</p>
      {/* Positions as rendered — from the engine, or hand-held. */}
      <p data-testid="rendered">
        {layout.nodes.map((n) => `${n.id}:${Math.round(n.position.x)},${Math.round(n.position.y)}`).join(' ')}
      </p>
      {/* The underlying source of truth, which an auto layout must not touch. */}
      <p data-testid="stored">
        {nodes.map((n) => `${n.id}:${Math.round(n.position.x)},${Math.round(n.position.y)}`).join(' ')}
      </p>

      <button onClick={() => layout.setMode('vertical')}>vertical</button>
      <button onClick={() => layout.setMode('horizontal')}>horizontal</button>
      <button onClick={() => layout.setMode(FREEFORM)}>freeform</button>
      <button onClick={() => drag('a', { x: 900, y: 800 })}>drag a</button>
      <button onClick={() => setNodes(layout.bake())}>bake</button>
    </div>
  );
};

const at = (id: string) => screen.getByTestId(id).textContent ?? '';

afterEach(cleanup);

describe('modes', () => {
  it('starts in freeform, rendering positions exactly as stored', () => {
    render(<Harness />);
    expect(at('mode')).toBe(FREEFORM);
    expect(at('is-auto')).toBe('false');
    expect(at('rendered')).toBe(at('stored'));
    expect(at('rendered')).toContain('a:11,22');
  });

  it('lists the available layouts, never freeform among them', () => {
    render(<Harness />);
    expect(at('available')).toBe('vertical,horizontal,grid');
    expect(at('available')).not.toContain(FREEFORM);
  });

  it('computes positions once a layout is active', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByText('vertical'));

    expect(at('is-auto')).toBe('true');
    // No longer where they were placed.
    expect(at('rendered')).not.toBe(at('stored'));
    // 'a' leads the chain, so it sits above 'b'.
    expect(at('rendered')).toMatch(/a:\d+,0/);
  });

  it('leaves the stored positions untouched while a layout is active', async () => {
    render(<Harness />);
    const before = at('stored');

    await userEvent.click(screen.getByText('vertical'));
    await userEvent.click(screen.getByText('horizontal'));

    expect(at('stored')).toBe(before);
  });

  it('restores the hand-made arrangement on returning to freeform', async () => {
    render(<Harness />);
    const original = at('rendered');

    await userEvent.click(screen.getByText('vertical'));
    expect(at('rendered')).not.toBe(original);

    await userEvent.click(screen.getByText('freeform'));
    // This is why an auto layout must not write back: the arrangement survives.
    expect(at('rendered')).toBe(original);
  });

  it('reports mode changes', async () => {
    const onModeChange = vi.fn();
    render(<Harness onModeChange={onModeChange} />);

    await userEvent.click(screen.getByText('vertical'));
    expect(onModeChange).toHaveBeenCalledWith('vertical');
  });

  it('starts in whichever mode it is given', () => {
    render(<Harness defaultMode="horizontal" />);
    expect(at('mode')).toBe('horizontal');
    expect(at('is-auto')).toBe('true');
  });

  it('falls back to hand-held positions for an unknown mode', () => {
    render(<Harness defaultMode="nonexistent" />);
    // No engine registered under that name, so nothing is computed.
    expect(at('is-auto')).toBe('false');
    expect(at('rendered')).toBe(at('stored'));
  });

  it('accepts custom layouts', async () => {
    const layouts = { flat: layeredLayout({ direction: 'right', layerSpacing: 500 }) };
    render(<Harness layouts={layouts} defaultMode="flat" />);

    expect(at('available')).toBe('flat');
    expect(at('is-auto')).toBe('true');
    expect(at('rendered')).not.toBe(at('stored'));
  });
});

describe('the freeform escape', () => {
  it('switches to freeform when a node is dragged under an auto layout', async () => {
    render(<Harness defaultMode="vertical" />);
    expect(at('mode')).toBe('vertical');

    await userEvent.click(screen.getByText('drag a'));

    // Grabbing a node must always work; the engine steps aside.
    expect(at('mode')).toBe(FREEFORM);
  });

  it('keeps the dragged position rather than snapping back', async () => {
    render(<Harness defaultMode="vertical" />);
    await userEvent.click(screen.getByText('drag a'));

    expect(at('rendered')).toContain('a:900,800');
    expect(at('stored')).toContain('a:900,800');
  });

  it('reports the escape as a mode change', async () => {
    const onModeChange = vi.fn();
    render(<Harness defaultMode="vertical" onModeChange={onModeChange} />);

    await userEvent.click(screen.getByText('drag a'));
    expect(onModeChange).toHaveBeenCalledWith(FREEFORM);
  });

  it('does not escape when escapeOnDrag is off', async () => {
    render(<Harness defaultMode="vertical" escapeOnDrag={false} />);
    await userEvent.click(screen.getByText('drag a'));

    // A derived visualisation rather than an editor: the drag is recorded but
    // the engine keeps placing nodes, so it has no visible effect.
    expect(at('mode')).toBe('vertical');
    expect(at('stored')).toContain('a:900,800');
    expect(at('rendered')).not.toContain('a:900,800');
  });

  it('records moves normally when already in freeform', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByText('drag a'));

    expect(at('mode')).toBe(FREEFORM);
    expect(at('rendered')).toContain('a:900,800');
  });
});

describe('bake', () => {
  it('writes the computed positions back, so hand editing starts from them', async () => {
    render(<Harness defaultMode="vertical" />);
    const computed = at('rendered');

    await userEvent.click(screen.getByText('bake'));
    await userEvent.click(screen.getByText('freeform'));

    // Without baking, switching to freeform would drop back to the old
    // arrangement; with it, the laid-out positions become the real ones.
    expect(at('rendered')).toBe(computed);
    expect(at('stored')).toBe(computed);
  });

  it('is a no-op in freeform', async () => {
    render(<Harness />);
    const before = at('stored');

    await userEvent.click(screen.getByText('bake'));
    expect(at('stored')).toBe(before);
  });
});
