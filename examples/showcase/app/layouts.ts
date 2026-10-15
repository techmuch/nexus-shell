import type { IJsonModel } from 'flexlayout-react';

/**
 * The showcase workbench's first-run layout: library, map and inspector.
 *
 * Lived in the library's `LayoutService` until 0.3.0, where every consumer
 * inherited it. It is this example's layout, so it lives here.
 */
export const dialogueMappingLayoutJson: IJsonModel = {
  global: { tabEnableClose: true, tabSetEnableMaximize: false, tabSetEnableDivide: true },
  borders: [],
  layout: {
    type: 'row',
    weight: 100,
    children: [
      {
        type: 'tabset',
        weight: 20,
        children: [{ type: 'tab', name: 'Node Library', component: 'dialogue-library' }],
      },
      {
        type: 'tabset',
        weight: 60,
        children: [
          {
            type: 'tab',
            name: 'Dialogue Map',
            component: 'dialogue-map',
            config: { hideInternalLibrary: true, hideInternalInspector: true },
          },
        ],
      },
      {
        type: 'tabset',
        weight: 20,
        children: [{ type: 'tab', name: 'Argument Inspector', component: 'argument-inspector' }],
      },
    ],
  },
};
