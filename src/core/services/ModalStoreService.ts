import { create } from 'zustand';

export type ModalType = 'alert' | 'confirm' | 'prompt';

interface ModalState {
  isOpen: boolean;
  type: ModalType;
  title: string;
  message: string;
  defaultValue?: string;
  resolve: ((value: any) => void) | null;
  
  openAlert: (message: string, title?: string) => Promise<void>;
  openConfirm: (message: string, title?: string) => Promise<boolean>;
  openPrompt: (message: string, defaultValue?: string, title?: string) => Promise<string | null>;
  
  close: (value?: any) => void;
}

export const useModalStore = create<ModalState>((set, get) => ({
  isOpen: false,
  type: 'alert',
  title: '',
  message: '',
  defaultValue: '',
  resolve: null,

  openAlert: (message, title = 'Alert') => {
    return new Promise<void>((resolve) => {
      set({ isOpen: true, type: 'alert', title, message, defaultValue: '', resolve: resolve as any });
    });
  },

  openConfirm: (message, title = 'Confirm') => {
    return new Promise<boolean>((resolve) => {
      set({ isOpen: true, type: 'confirm', title, message, defaultValue: '', resolve: resolve as any });
    });
  },

  openPrompt: (message, defaultValue = '', title = 'Prompt') => {
    return new Promise<string | null>((resolve) => {
      set({ isOpen: true, type: 'prompt', title, message, defaultValue, resolve: resolve as any });
    });
  },

  close: (value: any = null) => {
    const { resolve } = get();
    if (resolve) resolve(value);
    set({ isOpen: false, resolve: null });
  }
}));
