import type { Meta, StoryObj } from '@storybook/react';
import { GraphCanvas, GraphNode } from '../../../../src/index';
import { IbisNode } from './IbisNode';
import { NODE_SIZE, type IbisNodeType, type IDialogueNodeData } from '../DialogueMappingService';

/**
 * The IBIS card, on the library's own canvas.
 *
 * Note how little wrapping there is: `IbisNode` renders the card's contents and
 * `GraphNode` supplies placement, selection and ports. The card no longer knows
 * it is on a graph at all.
 */

const meta: Meta = {
  title: 'Examples/Dialogue Mapper/IBIS Node',
  parameters: { layout: 'padded' },
};

export default meta;

const Card = ({
  type,
  data,
  selected,
}: {
  type: IbisNodeType;
  data: IDialogueNodeData;
  selected?: boolean;
}) => (
  <div className="theme-dark h-[260px] w-[320px] overflow-hidden rounded-xl border border-border/80 bg-background">
    <GraphCanvas defaultViewport={{ x: 24, y: 20, scale: 1 }} pannable={false} zoomable={false}>
      <GraphNode
        node={{ id: 'demo', position: { x: 0, y: 0 }, size: NODE_SIZE, kind: type }}
        selected={selected}
        draggable={false}
      >
        <IbisNode type={type} data={data} />
      </GraphNode>
    </GraphCanvas>
  </div>
);

const base = (overrides: Partial<IDialogueNodeData> = {}): IDialogueNodeData => ({
  title: 'Untitled',
  author: 'user',
  timestamp: new Date().toLocaleDateString(),
  ...overrides,
});

export const Question: StoryObj = {
  render: () => (
    <Card
      type="question"
      data={base({
        title: 'Which authorization library is most secure for OAuth2 integration?',
        tags: ['security', 'oauth2'],
        author: 'security-lead',
        status: 'pending',
      })}
    />
  ),
};

export const Idea: StoryObj = {
  render: () => (
    <Card
      type="idea"
      data={base({
        title: 'Adopt the platform’s own OAuth2 client',
        tags: ['proposal'],
        author: 'platform',
        status: 'pending',
      })}
    />
  ),
};

export const Pro: StoryObj = {
  render: () => (
    <Card
      type="pro"
      data={base({ title: 'Already audited, and maintained in-house', author: 'security-lead' })}
    />
  ),
};

export const Con: StoryObj = {
  render: () => (
    <Card type="con" data={base({ title: 'No refresh-token rotation yet', author: 'platform' })} />
  ),
};

export const Decision: StoryObj = {
  render: () => (
    <Card
      type="decision"
      data={base({
        title: 'Use the platform client, add rotation in Q4',
        author: 'architecture',
        status: 'accepted',
      })}
    />
  ),
};

export const Link: StoryObj = {
  render: () => (
    <Card
      type="link"
      data={base({
        title: 'RFC 6749 — The OAuth 2.0 Authorization Framework',
        url: 'https://datatracker.ietf.org/doc/html/rfc6749',
        author: 'security-lead',
      })}
    />
  ),
};

/** Selected, so the focus and selection affordances are visible. */
export const Selected: StoryObj = {
  render: () => (
    <Card
      type="question"
      selected
      data={base({ title: 'Should we ship on Friday?', tags: ['release'], status: 'pending' })}
    />
  ),
};
