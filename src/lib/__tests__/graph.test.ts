import { describe, expect, it } from 'vitest';
import {
  IDENTITY_VIEWPORT,
  centerOn,
  clampScale,
  fitViewport,
  findNeighbour,
  graphBounds,
  isConnected,
  nextId,
  nodeRect,
  placeRelativeTo,
  portPoint,
  rectCenter,
  removeNode,
  resolvePorts,
  toGraphSpace,
  toScreenSpace,
  unionRect,
  viewportRect,
  zoomAt,
  type IGraphEdge,
  type IGraphNode,
} from '../graph';

const at = (id: string, x: number, y: number): IGraphNode => ({
  id,
  position: { x, y },
  size: { width: 100, height: 50 },
});

describe('coordinate transforms', () => {
  it('round-trips between screen and graph space', () => {
    const viewport = { x: 120, y: -40, scale: 1.75 };
    const point = { x: 33, y: 91 };

    const roundTripped = toScreenSpace(toGraphSpace(point, viewport), viewport);
    expect(roundTripped.x).toBeCloseTo(point.x);
    expect(roundTripped.y).toBeCloseTo(point.y);
  });

  it('is the identity at the identity viewport', () => {
    expect(toGraphSpace({ x: 10, y: 20 }, IDENTITY_VIEWPORT)).toEqual({ x: 10, y: 20 });
  });

  it('keeps the point under the cursor fixed while zooming', () => {
    const viewport = { x: 40, y: 60, scale: 1 };
    const cursor = { x: 200, y: 150 };

    const before = toGraphSpace(cursor, viewport);
    const after = toGraphSpace(cursor, zoomAt(viewport, cursor, 2.5));

    // This is the whole point of zoomAt: whatever was under the cursor stays
    // under it. Anything else feels wrong to use.
    expect(after.x).toBeCloseTo(before.x);
    expect(after.y).toBeCloseTo(before.y);
  });

  it('clamps scale to the allowed range', () => {
    expect(clampScale(99)).toBe(4);
    expect(clampScale(0.001)).toBe(0.1);
    expect(clampScale(1.5)).toBe(1.5);
    expect(clampScale(99, 0.5, 2)).toBe(2);
  });
});

describe('node geometry', () => {
  it('fills in the default size', () => {
    const rect = nodeRect({ id: 'a', position: { x: 5, y: 5 } });
    expect(rect.width).toBeGreaterThan(0);
    expect(rect.height).toBeGreaterThan(0);
  });

  it('resolves port points on the correct sides', () => {
    const rect = { x: 0, y: 0, width: 100, height: 50 };
    expect(portPoint(rect, 'top')).toEqual({ x: 50, y: 0 });
    expect(portPoint(rect, 'bottom')).toEqual({ x: 50, y: 50 });
    expect(portPoint(rect, 'left')).toEqual({ x: 0, y: 25 });
    expect(portPoint(rect, 'right')).toEqual({ x: 100, y: 25 });
    expect(rectCenter(rect)).toEqual({ x: 50, y: 25 });
  });

  it('picks facing ports from relative position', () => {
    const origin = nodeRect(at('a', 0, 0));

    expect(resolvePorts(origin, nodeRect(at('b', 400, 0)))).toEqual({
      source: 'right',
      target: 'left',
    });
    expect(resolvePorts(origin, nodeRect(at('b', -400, 0)))).toEqual({
      source: 'left',
      target: 'right',
    });
    expect(resolvePorts(origin, nodeRect(at('b', 0, 400)))).toEqual({
      source: 'bottom',
      target: 'top',
    });
    expect(resolvePorts(origin, nodeRect(at('b', 0, -400)))).toEqual({
      source: 'top',
      target: 'bottom',
    });
  });
});

describe('bounds and fitting', () => {
  it('returns null bounds for an empty graph', () => {
    expect(graphBounds([])).toBeNull();
    expect(fitViewport([], { width: 800, height: 600 })).toEqual(IDENTITY_VIEWPORT);
  });

  it('spans every node', () => {
    const bounds = graphBounds([at('a', 0, 0), at('b', 300, 200)])!;
    expect(bounds).toEqual({ x: 0, y: 0, width: 400, height: 250 });
  });

  it('centres the graph in the element', () => {
    const nodes = [at('a', 0, 0), at('b', 300, 200)];
    const size = { width: 800, height: 600 };
    const viewport = fitViewport(nodes, size);

    const centre = rectCenter(graphBounds(nodes)!);
    const onScreen = toScreenSpace(centre, viewport);

    expect(onScreen.x).toBeCloseTo(size.width / 2);
    expect(onScreen.y).toBeCloseTo(size.height / 2);
  });

  it('never zooms past the limits when fitting a tiny graph', () => {
    const viewport = fitViewport([at('a', 0, 0)], { width: 4000, height: 4000 });
    expect(viewport.scale).toBeLessThanOrEqual(4);
  });
});

describe('spatial navigation', () => {
  /*
   *      (up)
   *  (left) (o) (right)
   *     (down)      (far-right, offset)
   */
  const nodes = [
    at('o', 0, 0),
    at('right', 300, 0),
    at('left', -300, 0),
    at('up', 0, -300),
    at('down', 0, 300),
    at('offset', 900, 700),
  ];

  it.each([
    ['right', 'right'],
    ['left', 'left'],
    ['up', 'up'],
    ['down', 'down'],
  ] as const)('arrow %s finds the node in that direction', (direction, expected) => {
    expect(findNeighbour(nodes, 'o', direction)?.id).toBe(expected);
  });

  it('returns null when nothing lies that way', () => {
    expect(findNeighbour([at('o', 0, 0)], 'o', 'right')).toBeNull();
  });

  it('ignores nodes more off-axis than they are ahead', () => {
    // 'offset' is far right but even further down; travelling right should
    // not jump to it when a properly-aligned candidate exists.
    expect(findNeighbour(nodes, 'o', 'right')?.id).toBe('right');
  });

  it('prefers the nearer of two aligned candidates', () => {
    const line = [at('o', 0, 0), at('near', 200, 0), at('far', 800, 0)];
    expect(findNeighbour(line, 'o', 'right')?.id).toBe('near');
  });

  it('returns null for an unknown origin', () => {
    expect(findNeighbour(nodes, 'nope', 'right')).toBeNull();
  });
});

describe('placeRelativeTo', () => {
  it('places a node clear of the origin, in the direction asked', () => {
    const nodes = [at('a', 0, 0)];
    const position = placeRelativeTo(nodes, 'a', 'right');
    expect(position.x).toBeGreaterThan(100);
    expect(position.y).toBe(0);
  });

  it('avoids landing on top of an existing node', () => {
    // The obvious slot to the right is taken, so it must find another.
    const nodes = [at('a', 0, 0), at('b', 164, 0)];
    const position = placeRelativeTo(nodes, 'a', 'right');

    const collides = nodes.some((node) => {
      const r = nodeRect(node);
      return (
        position.x < r.x + r.width &&
        position.x + 100 > r.x &&
        position.y < r.y + r.height &&
        position.y + 50 > r.y
      );
    });
    expect(collides).toBe(false);
  });

  it('falls back to the origin for an unknown node', () => {
    expect(placeRelativeTo([], 'nope', 'right')).toEqual({ x: 0, y: 0 });
  });
});

describe('graph queries', () => {
  const edges: IGraphEdge[] = [
    { id: 'e1', source: 'a', target: 'b' },
    { id: 'e2', source: 'b', target: 'c' },
  ];

  it('detects a connection in either direction', () => {
    expect(isConnected(edges, 'a', 'b')).toBe(true);
    expect(isConnected(edges, 'b', 'a')).toBe(true);
    expect(isConnected(edges, 'a', 'c')).toBe(false);
  });

  it('removes a node and every edge touching it', () => {
    const nodes = [at('a', 0, 0), at('b', 100, 0), at('c', 200, 0)];
    const result = removeNode(nodes, edges, 'b');

    expect(result.nodes.map((n) => n.id)).toEqual(['a', 'c']);
    expect(result.edges).toEqual([]);
  });

  it('generates ids that do not collide', () => {
    const existing = [{ id: 'node-1' }, { id: 'node-2' }];
    expect(nextId('node', existing)).toBe('node-3');
    expect(nextId('node', [...existing, { id: 'node-3' }])).toBe('node-4');
  });
});

describe('viewport rect', () => {
  it('reports the whole element at the identity viewport', () => {
    const rect = viewportRect(IDENTITY_VIEWPORT, { width: 800, height: 600 });
    expect(rect).toEqual({ x: 0, y: 0, width: 800, height: 600 });
  });

  it('shrinks as the canvas zooms in', () => {
    const rect = viewportRect({ x: 0, y: 0, scale: 2 }, { width: 800, height: 600 });
    expect(rect.width).toBe(400);
    expect(rect.height).toBe(300);
  });

  it('matches what the transforms say is on screen', () => {
    const viewport = { x: -120, y: 60, scale: 1.5 };
    const size = { width: 800, height: 600 };
    const rect = viewportRect(viewport, size);

    // The rect's corners must map back to the element's corners.
    const topLeft = toScreenSpace({ x: rect.x, y: rect.y }, viewport);
    const bottomRight = toScreenSpace(
      { x: rect.x + rect.width, y: rect.y + rect.height },
      viewport,
    );

    expect(topLeft.x).toBeCloseTo(0);
    expect(topLeft.y).toBeCloseTo(0);
    expect(bottomRight.x).toBeCloseTo(size.width);
    expect(bottomRight.y).toBeCloseTo(size.height);
  });
});

describe('centerOn', () => {
  it('puts the point at the middle of the element', () => {
    const size = { width: 800, height: 600 };
    const target = { x: 1234, y: -567 };

    const onScreen = toScreenSpace(target, centerOn(target, size, 1.25));

    expect(onScreen.x).toBeCloseTo(size.width / 2);
    expect(onScreen.y).toBeCloseTo(size.height / 2);
  });

  it('preserves the zoom it was given', () => {
    expect(centerOn({ x: 0, y: 0 }, { width: 100, height: 100 }, 2.5).scale).toBe(2.5);
  });
});

describe('unionRect', () => {
  it('spans both rectangles', () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    const b = { x: 100, y: 50, width: 10, height: 10 };
    expect(unionRect(a, b)).toEqual({ x: 0, y: 0, width: 110, height: 60 });
  });

  it('is unchanged when one contains the other', () => {
    const outer = { x: 0, y: 0, width: 100, height: 100 };
    const inner = { x: 10, y: 10, width: 10, height: 10 };
    expect(unionRect(outer, inner)).toEqual(outer);
  });

  it('handles negative coordinates', () => {
    const a = { x: -50, y: -50, width: 10, height: 10 };
    const b = { x: 0, y: 0, width: 10, height: 10 };
    expect(unionRect(a, b)).toEqual({ x: -50, y: -50, width: 60, height: 60 });
  });
});
