import { useRef, useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphCanvas } from '../GraphCanvas';
import { GraphNode } from '../GraphNode';
import { useGraphKeyboard } from '../useGraphKeyboard';
import { nextId, removeNode, type IGraphEdge, type IGraphNode } from '../../../lib/graph';

/**
 * The keyboard model is the reason this layer exists: a graph editor that needs
 * a mouse is only half an editor. These drive the real components through real
 * key events rather than calling the hook directly, because the thing worth
 * protecting is the end-to-end behaviour.
 */

const START: IGraphNode[] = [
  { id: 'a', position: { x: 0, y: 0 }, size: { width: 100, height: 50 }, data: { label: 'A' } },
  { id: 'b', position: { x: 300, y: 0 }, size: { width: 100, height: 50 }, data: { label: 'B' } },
  { id: 'c', position: { x: 0, y: 300 }, size: { width: 100, height: 50 }, data: { label: 'C' } },
];

/** A minimal editor, close to what a consumer would write. */
const Editor = ({ initial = START }: { initial?: IGraphNode[] }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<IGraphNode[]>(initial);
  const [edges, setEdges] = useState<IGraphEdge[]>([]);

  const keyboard = useGraphKeyboard({
    nodes,
    edges,
    targetRef: canvasRef,
    onCreateNode: (position) => {
      const id = nextId('n', nodes);
      setNodes((current) => [...current, { id, position, data: { label: id } }]);
      return id;
    },
    onConnect: (source, target) =>
      setEdges((current) => [...current, { id: nextId('e', current), source, target }]),
    onDeleteNode: (id) =>
      setNodes((current) => removeNode(current, edges, id).nodes),
    onMoveNode: (id, position) =>
      setNodes((current) => current.map((n) => (n.id === id ? { ...n, position } : n))),
  });

  return (
    <div>
      <div ref={canvasRef} tabIndex={0} data-testid="canvas">
        <GraphCanvas>
          {nodes.map((node) => (
            <GraphNode key={node.id} node={node} focused={node.id === keyboard.focusedId}>
              <span>{String((node.data as { label: string }).label)}</span>
            </GraphNode>
          ))}
        </GraphCanvas>
      </div>

      {/* Probes, so assertions read against behaviour rather than internals. */}
      <p data-testid="focused">{keyboard.focusedId ?? 'none'}</p>
      <p data-testid="editing">{keyboard.editingId ?? 'none'}</p>
      <p data-testid="connecting">{keyboard.connectingFrom ?? 'none'}</p>
      <p data-testid="node-count">{nodes.length}</p>
      <p data-testid="edges">{edges.map((e) => `${e.source}>${e.target}`).join(',')}</p>
      <p data-testid="positions">
        {nodes.map((n) => `${n.id}:${n.position.x},${n.position.y}`).join(' ')}
      </p>
    </div>
  );
};

const at = (testId: string) => screen.getByTestId(testId).textContent;

const focusCanvas = async () => {
  const canvas = screen.getByTestId('canvas');
  canvas.focus();
  return canvas;
};

afterEach(cleanup);

describe('keyboard navigation', () => {
  it('adopts the first node when an arrow is pressed with nothing focused', async () => {
    render(<Editor />);
    await focusCanvas();

    expect(at('focused')).toBe('none');
    await userEvent.keyboard('{ArrowRight}');
    // Without this, the graph would be unreachable without a click.
    expect(at('focused')).toBe('a');
  });

  it('moves focus spatially, not by insertion order', async () => {
    render(<Editor />);
    await focusCanvas();

    await userEvent.keyboard('{ArrowRight}'); // adopts 'a'
    await userEvent.keyboard('{ArrowRight}'); // a -> b, to the right
    expect(at('focused')).toBe('b');

    await userEvent.keyboard('{ArrowLeft}'); // back to a
    expect(at('focused')).toBe('a');

    await userEvent.keyboard('{ArrowDown}'); // a -> c, below
    expect(at('focused')).toBe('c');
  });

  it('stays put when nothing lies in that direction', async () => {
    render(<Editor />);
    await focusCanvas();

    await userEvent.keyboard('{ArrowRight}{ArrowRight}'); // focus 'b'
    await userEvent.keyboard('{ArrowRight}'); // nothing further right
    expect(at('focused')).toBe('b');
  });

  it('clears focus on Escape', async () => {
    render(<Editor />);
    await focusCanvas();

    await userEvent.keyboard('{ArrowRight}');
    expect(at('focused')).toBe('a');
    await userEvent.keyboard('{Escape}');
    expect(at('focused')).toBe('none');
  });
});

describe('keyboard editing', () => {
  it('creates a connected node on Tab and follows it', async () => {
    render(<Editor />);
    await focusCanvas();

    await userEvent.keyboard('{ArrowRight}'); // focus 'a'
    expect(at('node-count')).toBe('3');

    await userEvent.keyboard('{Tab}');

    expect(at('node-count')).toBe('4');
    // Focus follows the new node, and it is wired to the one it came from.
    expect(at('focused')).toBe('n-4');
    expect(at('edges')).toBe('a>n-4');
    // Creating from the keyboard means you want to name it.
    expect(at('editing')).toBe('n-4');
  });

  it('does not place the new node on top of an existing one', async () => {
    render(<Editor />);
    await focusCanvas();

    await userEvent.keyboard('{ArrowRight}{Tab}');

    const positions = at('positions') ?? '';
    const created = /n-4:(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/.exec(positions);
    expect(created).not.toBeNull();

    const [, x] = created!;
    // 'b' sits at x=300 with width 100; the new node must clear 'a' and not
    // land inside 'b'.
    expect(Number(x)).toBeGreaterThan(100);
  });

  it('enters edit mode on Enter and leaves on Escape', async () => {
    render(<Editor />);
    await focusCanvas();

    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{Enter}');
    expect(at('editing')).toBe('a');

    await userEvent.keyboard('{Escape}');
    expect(at('editing')).toBe('none');
    // Escape left edit mode but kept focus, rather than clearing both.
    expect(at('focused')).toBe('a');
  });

  it('deletes the focused node and moves focus somewhere sensible', async () => {
    render(<Editor />);
    await focusCanvas();

    await userEvent.keyboard('{ArrowRight}{ArrowRight}'); // focus 'b'
    await userEvent.keyboard('{Delete}');

    expect(at('node-count')).toBe('2');
    expect(at('focused')).not.toBe('b');
    expect(at('focused')).not.toBe('none');
  });

  it('nudges the focused node with Shift and an arrow', async () => {
    render(<Editor />);
    await focusCanvas();

    await userEvent.keyboard('{ArrowRight}'); // focus 'a' at 0,0
    await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');

    expect(at('positions')).toContain('a:16,0');
    // Nudging moves the node, it does not move focus.
    expect(at('focused')).toBe('a');
  });
});

describe('keyboard connecting', () => {
  it('connects two nodes with c then Enter', async () => {
    render(<Editor />);
    await focusCanvas();

    await userEvent.keyboard('{ArrowRight}'); // focus 'a'
    await userEvent.keyboard('c'); // begin connecting
    expect(at('connecting')).toBe('a');

    await userEvent.keyboard('{ArrowRight}'); // move to 'b'
    await userEvent.keyboard('{Enter}'); // complete

    expect(at('edges')).toBe('a>b');
    expect(at('connecting')).toBe('none');
    // Completing a connection must not drop into edit mode.
    expect(at('editing')).toBe('none');
  });

  it('cancels a pending connection on Escape without clearing focus', async () => {
    render(<Editor />);
    await focusCanvas();

    await userEvent.keyboard('{ArrowRight}c');
    expect(at('connecting')).toBe('a');

    await userEvent.keyboard('{Escape}');
    expect(at('connecting')).toBe('none');
    expect(at('focused')).toBe('a');
    expect(at('edges')).toBe('');
  });
});

describe('keyboard scoping', () => {
  it('ignores keys typed into a field on the canvas', async () => {
    const WithField = () => (
      <div>
        <Editor />
        <input data-testid="field" aria-label="unrelated" />
      </div>
    );
    render(<WithField />);

    await userEvent.click(screen.getByTestId('field'));
    await userEvent.keyboard('cc{Delete}');

    // Typing 'c' in a field must not start a connection.
    expect(at('connecting')).toBe('none');
    expect(at('node-count')).toBe('3');
  });

  it('drops focus when the focused node disappears', async () => {
    const Disappearing = () => {
      const [nodes] = useState(START);
      const [shown, setShown] = useState(nodes);
      return (
        <div>
          <button onClick={() => setShown(shown.filter((n) => n.id !== 'a'))}>drop</button>
          <Editor initial={shown} />
        </div>
      );
    };
    render(<Disappearing />);

    await focusCanvas();
    await userEvent.keyboard('{ArrowRight}');
    expect(at('focused')).toBe('a');

    await userEvent.keyboard('{Delete}');
    // The cursor must never point at a node that no longer exists.
    expect(at('focused')).not.toBe('a');
  });
});
