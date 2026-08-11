import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';

const meta = {
  title: 'Primitives/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A centered dialog covering alert, confirm and prompt. Fully controlled — it owns only the prompt\'s draft text. Escape, backdrop click and the close button all route to `onCancel`; Enter routes to `onConfirm`. See `ConnectedModal` for the promise-based variant that lets you `await useModalStore.getState().openConfirm(...)` from anywhere.',
      },
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One button. `onConfirm` receives no value. */
export const Alert: Story = {
  args: {
    open: true,
    type: 'alert',
    title: 'Build failed',
    message: 'tsc exited with code 2.\nSee the terminal for details.',
  },
};

/** Cancel and Confirm. `onConfirm` receives no value; the caller infers `true`. */
export const Confirm: Story = {
  args: {
    open: true,
    type: 'confirm',
    title: 'Discard changes?',
    message: 'This file has unsaved changes. Closing it will discard them.',
  },
};

/** Adds a text input, autofocused and selected. `onConfirm` receives its value. */
export const Prompt: Story = {
  args: {
    open: true,
    type: 'prompt',
    title: 'Rename file',
    message: 'Enter a new name for this file.',
    defaultValue: 'untitled.tsx',
  },
};

/** Button labels are overridable when OK/Confirm/Cancel are too generic. */
export const CustomLabels: Story = {
  args: {
    open: true,
    type: 'confirm',
    title: 'Delete 3 files?',
    message: 'This cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Keep',
  },
};

/** Title only — `message` is optional. */
export const TitleOnly: Story = {
  args: { open: true, type: 'confirm', title: 'Are you sure?' },
};

/** Open it for real to exercise Escape, backdrop click and Enter. */
export const Interactive: Story = {
  args: { open: false, title: '' },
  render: function Render() {
    const [open, setOpen] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    return (
      <div className="p-8 flex flex-col items-start gap-4">
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground"
        >
          Rename file…
        </button>
        <p className="text-xs text-muted-foreground">
          {result === null ? 'No result yet.' : `Result: ${result}`}
        </p>
        <Modal
          open={open}
          type="prompt"
          title="Rename file"
          message="Enter a new name."
          defaultValue="untitled.tsx"
          onConfirm={(value) => {
            setResult(value ?? '');
            setOpen(false);
          }}
          onCancel={() => {
            setResult('cancelled');
            setOpen(false);
          }}
        />
      </div>
    );
  },
};
