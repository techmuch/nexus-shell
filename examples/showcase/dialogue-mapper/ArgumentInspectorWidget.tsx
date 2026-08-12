import React from 'react';
import type { TabNode } from 'flexlayout-react';
import { DialogueMapperInspector } from './DialogueMapperInspector';

/**
 * The inspector as a dockable tab.
 *
 * This used to be a second, near-identical copy of the inspector's markup. It
 * is now a wrapper that reads the tab's `mapId` and defers — the same panel,
 * whether it is docked beside the canvas or embedded in the mapper.
 */
export const ArgumentInspectorWidget: React.FC<{ node?: TabNode }> = ({ node }) => (
  <DialogueMapperInspector mapId={node?.getConfig?.()?.mapId} />
);

export default ArgumentInspectorWidget;
