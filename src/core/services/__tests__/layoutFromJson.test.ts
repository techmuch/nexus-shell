import { describe, expect, it } from 'vitest';
import { defaultLayout, layoutFromJson } from '../LayoutService';

describe('layoutFromJson', () => {
  it('hides an empty border, so no blank strip is drawn down the edge', () => {
    expect(layoutFromJson(defaultLayout).toJson().global?.borderEnableAutoHide).toBe(true);
  });

  it('hides it in a layout stored before the setting existed', () => {
    const stored = { ...defaultLayout, global: { tabEnableClose: true } };
    expect(layoutFromJson(stored).toJson().global?.borderEnableAutoHide).toBe(true);
  });

  it('keeps the strip for an app that asks for it', () => {
    const json = { ...defaultLayout, global: { borderEnableAutoHide: false } };
    expect(layoutFromJson(json).toJson().global?.borderEnableAutoHide).not.toBe(true);
  });
});
