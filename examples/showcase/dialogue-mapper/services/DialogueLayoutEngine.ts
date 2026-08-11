import { Node, Edge } from 'reactflow';
import { IDialogueNodeData } from '../DialogueMappingService';

/**
 * pure layoutDialogueNodes function:
 * Takes nodes, edges, and layout direction, and computes updated node positions
 * using a BFS topological layout. Returns a new array of nodes with updated positions.
 */
export function layoutDialogueNodes(
  nodes: Node<IDialogueNodeData>[],
  edges: Edge[],
  direction: 'vertical' | 'horizontal' | 'grid'
): Node<IDialogueNodeData>[] {
  if (nodes.length === 0) return [];

  // 1. Calculate incoming edge counts for each node
  const incomingEdgeCounts: Record<string, number> = {};
  nodes.forEach((n) => {
    incomingEdgeCounts[n.id] = 0;
  });
  edges.forEach((e) => {
    if (incomingEdgeCounts[e.target] !== undefined) {
      incomingEdgeCounts[e.target]++;
    }
  });

  // 2. Queue initialization with root nodes (0 incoming edges)
  const levels: Record<string, number> = {};
  const queue: string[] = [];
  nodes.forEach((n) => {
    if (incomingEdgeCounts[n.id] === 0) {
      levels[n.id] = 0;
      queue.push(n.id);
    }
  });

  // Fallback if there are cycles: initialize all unassigned nodes to level 0
  if (queue.length === 0 && nodes.length > 0) {
    levels[nodes[0].id] = 0;
    queue.push(nodes[0].id);
  }

  // 3. BFS topological sort to assign layout levels/layers
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentLevel = levels[currentId] || 0;
    
    const outgoingEdges = edges.filter((e) => e.source === currentId);
    outgoingEdges.forEach((e) => {
      const nextId = e.target;
      const nextLevel = levels[nextId];
      if (nextLevel === undefined || nextLevel < currentLevel + 1) {
        levels[nextId] = currentLevel + 1;
        queue.push(nextId);
      }
    });
  }

  // 4. Group nodes by their layout levels
  const nodesByLevel: Record<number, string[]> = {};
  nodes.forEach((n) => {
    const lvl = levels[n.id] !== undefined ? levels[n.id] : 0;
    if (!nodesByLevel[lvl]) {
      nodesByLevel[lvl] = [];
    }
    nodesByLevel[lvl].push(n.id);
  });

  // 5. Calculate coordinates for each level/node based on layout mode
  const spacingX = 320;
  const spacingY = 250;

  return nodes.map((node) => {
    const lvl = levels[node.id] !== undefined ? levels[node.id] : 0;
    const levelNodes = nodesByLevel[lvl];
    const index = levelNodes.indexOf(node.id);
    const totalInLevel = levelNodes.length;

    let position = { x: node.position.x, y: node.position.y };

    if (direction === 'vertical') {
      // Center-aligned tree layout
      const offset = ((totalInLevel - 1) * spacingX) / 2;
      position = {
        x: 400 + index * spacingX - offset,
        y: 50 + lvl * spacingY,
      };
    } else if (direction === 'horizontal') {
      // Left-to-right hierarchy layout
      const offset = ((totalInLevel - 1) * spacingY) / 2;
      position = {
        x: 50 + lvl * spacingX,
        y: 300 + index * spacingY - offset,
      };
    } else if (direction === 'grid') {
      // Grid organization
      const cols = 3;
      const col = index % cols;
      const row = Math.floor(index / cols);
      position = {
        x: 50 + col * spacingX + lvl * 100,
        y: 50 + row * spacingY + lvl * 150,
      };
    }

    return {
      ...node,
      position,
    };
  });
}
