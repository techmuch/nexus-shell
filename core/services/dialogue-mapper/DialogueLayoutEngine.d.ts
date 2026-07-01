import { Node, Edge } from 'reactflow';
import { IDialogueNodeData } from '../DialogueMappingService';

/**
 * pure layoutDialogueNodes function:
 * Takes nodes, edges, and layout direction, and computes updated node positions
 * using a BFS topological layout. Returns a new array of nodes with updated positions.
 */
export declare function layoutDialogueNodes(nodes: Node<IDialogueNodeData>[], edges: Edge[], direction: 'vertical' | 'horizontal' | 'grid'): Node<IDialogueNodeData>[];
