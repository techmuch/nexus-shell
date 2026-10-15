import type { ReactNode } from 'react';
import { create } from 'zustand';

export type ModalType = 'alert' | 'confirm' | 'prompt';

/** Options for {@link ModalState.openCustom}. */
export interface CustomModalOptions {
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether a backdrop click cancels (resolving `undefined`). Defaults to `true`. */
  closeOnBackdrop?: boolean;
}

/**
 * Renders a custom dialog's content. `close(value)` resolves the promise
 * `openCustom` returned and dismisses the dialog.
 */
export type CustomModalRender<T> = (close: (value?: T) => void) => ReactNode;

interface ModalState {
  isOpen: boolean;
  type: ModalType;
  title: string;
  message: string;
  defaultValue?: string;
  resolve: ((value: any) => void) | null;
  /** Set while a custom dialog is open. */
  render: CustomModalRender<any> | null;
  size?: CustomModalOptions['size'];
  closeOnBackdrop: boolean;
  
  openAlert: (message: string, title?: string) => Promise<void>;
  openConfirm: (message: string, title?: string) => Promise<boolean>;
  openPrompt: (message: string, defaultValue?: string, title?: string) => Promise<string | null>;
  /**
   * Open a dialog with arbitrary content. Resolves with whatever the content
   * passes to `close`, or `undefined` when dismissed (Escape, backdrop, X).
   *
   * @example
   * ```tsx
   * const saved = await useModalStore.getState().openCustom<Event>(
   *   (close) => <EventEditor onSave={close} onCancel={() => close()} />,
   *   { title: 'New event', size: 'lg' },
   * );
   * ```
   */
  openCustom: <T = unknown>(render: CustomModalRender<T>, options: CustomModalOptions) => Promise<T | undefined>;
  
  close: (value?: any) => void;
}

/**
 * One dialog at a time: opening another settles the one showing as dismissed,
 * so its caller's `await` never hangs.
 */
const settle = (get: () => ModalState) => {
  const { resolve, render, type } = get();
  if (!resolve) return;
  resolve(render ? undefined : type === 'confirm' ? false : type === 'prompt' ? null : undefined);
};

export const useModalStore = create<ModalState>((set, get) => ({
  isOpen: false,
  type: 'alert',
  title: '',
  message: '',
  defaultValue: '',
  resolve: null,
  render: null,
  size: undefined,
  closeOnBackdrop: true,

  openAlert: (message, title = 'Alert') => {
    return new Promise<void>((resolve) => {
      settle(get);
      set({ isOpen: true, type: 'alert', title, message, defaultValue: '', resolve: resolve as any, render: null, size: undefined, closeOnBackdrop: true });
    });
  },

  openConfirm: (message, title = 'Confirm') => {
    return new Promise<boolean>((resolve) => {
      settle(get);
      set({ isOpen: true, type: 'confirm', title, message, defaultValue: '', resolve: resolve as any, render: null, size: undefined, closeOnBackdrop: true });
    });
  },

  openPrompt: (message, defaultValue = '', title = 'Prompt') => {
    return new Promise<string | null>((resolve) => {
      settle(get);
      set({ isOpen: true, type: 'prompt', title, message, defaultValue, resolve: resolve as any, render: null, size: undefined, closeOnBackdrop: true });
    });
  },

  openCustom: (render, options) =>
    new Promise((resolve) => {
      settle(get);
      set({
        isOpen: true,
        type: 'alert',
        title: options.title,
        message: '',
        defaultValue: '',
        resolve: resolve as any,
        render: render as CustomModalRender<any>,
        size: options.size,
        closeOnBackdrop: options.closeOnBackdrop ?? true,
      });
    }),

  close: (...args: [value?: any]) => {
    const { resolve, render } = get();
    // No argument: a preset dialog resolves null (as it always has), a custom
    // one undefined — "dismissed", per `openCustom`'s contract.
    const value = args.length > 0 ? args[0] : render ? undefined : null;
    if (resolve) resolve(value);
    set({ isOpen: false, resolve: null, render: null });
  }
}));
