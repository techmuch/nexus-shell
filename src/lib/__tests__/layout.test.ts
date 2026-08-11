import { describe, expect, it } from 'vitest';
import { BUILT_IN_LAYOUTS, gridLayout, layeredLayout } from '../layout';
import { nodeRect, type IGraphEdge, type IGraphNode } from '../graph';

/**
 * Layouts are pure functions, which makes them the easiest part of the graph
 * layer to pin down precisely. These assert the properties that matter —
 * ordering, no overlap, totality over awkward graphs — rather than exact
 * coordinates, which would break on any spacing tweak.
 */

const node = (id: string, size = { width: 100, height: 50 }): IGraphNode => ({
  id,
  position: { x: 0, y: 0 },
  size,
});

const edge = (source: string, target: string): IGraphEdge => ({
  id: `${source}->${target}`,
  source,
  target,
});

/** A small tree: a → b, a → c, b → d. */
const TREE_NODES = ['a', 'b', 'c', 'd'].map((id) => node(id));
const TREE_EDGES = [edge('a', 'b'), edge('a', 'c'), edge('b', 'd')];

const byId = (nodes: IGraphNode[]) => Object.fromEntries(nodes.map((n) => [n.id, n]));

/** Do any two nodes overlap? The one thing a layout must never produce. */
const anyOverlap = (nodes: IGraphNode[]) =>
  nodes.some((a, i) =>
    nodes.slice(i + 1).some((b) => {
      const ra = nodeRect(a);
      const rb = nodeRect(b);
      return (
        ra.x < rb.x + rb.width &&
        ra.x + ra.width > rb.x &&
        ra.y < rb.y + rb.height &&
        ra.y + ra.height > rb.y
      );
    }),
  );

describe('layeredLayout', () => {
  it('returns a node for every input, and mutates none of them', () => {
    const input = TREE_NODES.map((n) => ({ ...n, position: { ...n.position } }));
    const result = layeredLayout()(input, TREE_EDGES);

    expect(result).toHaveLength(input.length);
    expect(result.map((n) => n.id).sort()).toEqual(['a', 'b', 'c', 'd']);
    // The originals are untouched — the layout is a transform, not a mutation.
    expect(input.every((n) => n.position.x === 0 && n.position.y === 0)).toBe(true);
  });

  it('places each node below its predecessor when flowing down', () => {
    const result = byId(layeredLayout({ direction: 'down' })(TREE_NODES, TREE_EDGES));

    expect(result.b.position.y).toBeGreaterThan(result.a.position.y);
    expect(result.c.position.y).toBeGreaterThan(result.a.position.y);
    expect(result.d.position.y).toBeGreaterThan(result.b.position.y);
    // Siblings share a layer.
    expect(result.b.position.y).toBe(result.c.position.y);
  });

  it('flows right when asked', () => {
    const result = byId(layeredLayout({ direction: 'right' })(TREE_NODES, TREE_EDGES));

    expect(result.b.position.x).toBeGreaterThan(result.a.position.x);
    expect(result.d.position.x).toBeGreaterThan(result.b.position.x);
    expect(result.b.position.x).toBe(result.c.position.x);
  });

  it.each([
    ['up', 'down'],
    ['left', 'right'],
  ] as const)('%s mirrors %s', (reversed, forward) => {
    const axis = reversed === 'up' ? 'y' : 'x';
    const a = byId(layeredLayout({ direction: forward })(TREE_NODES, TREE_EDGES));
    const b = byId(layeredLayout({ direction: reversed })(TREE_NODES, TREE_EDGES));

    // Deepest node leads in the forward direction, trails in the reversed one.
    expect(a.d.position[axis]).toBeGreaterThan(a.a.position[axis]);
    expect(b.d.position[axis]).toBeLessThan(b.a.position[axis]);
  });

  it('never overlaps nodes, including mixed sizes', () => {
    const mixed = [
      node('a', { width: 300, height: 40 }),
      node('b', { width: 80, height: 120 }),
      node('c', { width: 160, height: 60 }),
      node('d', { width: 100, height: 50 }),
    ];
    // A fixed step would collide here; sizes have to be read.
    expect(anyOverlap(layeredLayout()(mixed, TREE_EDGES))).toBe(false);
    expect(anyOverlap(layeredLayout({ direction: 'right' })(mixed, TREE_EDGES))).toBe(false);
  });

  it('honours spacing options', () => {
    const tight = byId(layeredLayout({ layerSpacing: 20 })(TREE_NODES, TREE_EDGES));
    const loose = byId(layeredLayout({ layerSpacing: 400 })(TREE_NODES, TREE_EDGES));

    const tightGap = tight.b.position.y - tight.a.position.y;
    const looseGap = loose.b.position.y - loose.a.position.y;
    expect(looseGap).toBeGreaterThan(tightGap);
  });

  it('starts at the origin it is given', () => {
    const result = layeredLayout({ origin: { x: 500, y: 300 } })(TREE_NODES, TREE_EDGES);
    const minX = Math.min(...result.map((n) => n.position.x));
    const minY = Math.min(...result.map((n) => n.position.y));

    expect(minX).toBeGreaterThanOrEqual(500);
    expect(minY).toBeGreaterThanOrEqual(300);
  });

  it('left-aligns every layer when told to', () => {
    const result = byId(
      layeredLayout({ align: 'start' })(TREE_NODES, TREE_EDGES),
    );
    // 'a' and 'b' both lead their layers, so both sit at the left edge.
    expect(result.a.position.x).toBe(result.b.position.x);
  });

  /* ------------------------------------------------------- awkward graphs */

  it('places disconnected nodes rather than leaving them at the origin', () => {
    const nodes = [...TREE_NODES, node('lonely')];
    const result = byId(layeredLayout()(nodes, TREE_EDGES));

    expect(result.lonely).toBeDefined();
    expect(anyOverlap(Object.values(result))).toBe(false);
  });

  it('terminates on a cycle and still places every node', () => {
    const nodes = ['a', 'b', 'c'].map((id) => node(id));
    const cyclic = [edge('a', 'b'), edge('b', 'c'), edge('c', 'a')];

    const result = layeredLayout()(nodes, cyclic);

    expect(result).toHaveLength(3);
    expect(anyOverlap(result)).toBe(false);
  });

  it('terminates on a self-loop', () => {
    const result = layeredLayout()([node('a')], [edge('a', 'a')]);
    expect(result).toHaveLength(1);
  });

  it('ignores edges pointing at nodes that are not present', () => {
    const result = layeredLayout()(TREE_NODES, [...TREE_EDGES, edge('a', 'ghost')]);
    expect(result).toHaveLength(4);
  });

  it('handles an empty graph', () => {
    expect(layeredLayout()([], [])).toEqual([]);
  });

  it('handles a graph with no edges', () => {
    const result = layeredLayout()(TREE_NODES, []);
    // All roots, so one layer; they must still not collide.
    expect(anyOverlap(result)).toBe(false);
  });

  it('is deterministic', () => {
    const once = layeredLayout()(TREE_NODES, TREE_EDGES);
    const twice = layeredLayout()(TREE_NODES, TREE_EDGES);
    expect(once).toEqual(twice);
  });
});

describe('gridLayout', () => {
  const nodes = Array.from({ length: 7 }, (_, i) => node(`n${i}`));

  it('fills rows to the column count', () => {
    const result = gridLayout({ columns: 3 })(nodes, []);

    // First three share a row.
    expect(result[0].position.y).toBe(result[1].position.y);
    expect(result[1].position.y).toBe(result[2].position.y);
    // Fourth starts the next one.
    expect(result[3].position.y).toBeGreaterThan(result[0].position.y);
    expect(result[3].position.x).toBe(result[0].position.x);
  });

  it('defaults to a roughly square grid', () => {
    const result = gridLayout()(nodes, []);
    const rows = new Set(result.map((n) => n.position.y)).size;
    const cols = new Set(result.map((n) => n.position.x)).size;
    expect(Math.abs(rows - cols)).toBeLessThanOrEqual(1);
  });

  it('never overlaps, including mixed sizes', () => {
    const mixed = [
      node('a', { width: 300, height: 40 }),
      node('b', { width: 80, height: 200 }),
      node('c', { width: 160, height: 60 }),
      node('d', { width: 100, height: 50 }),
    ];
    expect(anyOverlap(gridLayout({ columns: 2 })(mixed, []))).toBe(false);
  });

  it('ignores edges', () => {
    const withEdges = gridLayout({ columns: 3 })(nodes, TREE_EDGES);
    const without = gridLayout({ columns: 3 })(nodes, []);
    expect(withEdges).toEqual(without);
  });

  it('handles an empty graph and a single node', () => {
    expect(gridLayout()([], [])).toEqual([]);
    expect(gridLayout()([node('a')], [])).toHaveLength(1);
  });
});

describe('BUILT_IN_LAYOUTS', () => {
  it('offers vertical, horizontal and grid', () => {
    expect(Object.keys(BUILT_IN_LAYOUTS).sort()).toEqual([
      'grid',
      'horizontal',
      'vertical',
    ]);
  });

  it('never registers anything named freeform, which is a mode not a layout', () => {
    expect(BUILT_IN_LAYOUTS).not.toHaveProperty('freeform');
  });

  it.each(Object.entries(BUILT_IN_LAYOUTS))('%s places every node', (_name, layout) => {
    const result = layout(TREE_NODES, TREE_EDGES);
    expect(result).toHaveLength(TREE_NODES.length);
    expect(anyOverlap(result)).toBe(false);
  });
});
