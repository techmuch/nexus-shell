import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { GlobalModal } from '../components/widgets/GlobalModal';
import { useModalStore } from '../core/services/ModalStoreService';

const meta: Meta<typeof GlobalModal> = {
  title: 'Widgets/Shell/GlobalModal',
  component: GlobalModal,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-screen h-screen min-h-[400px] flex items-center justify-center bg-background p-4 relative">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof GlobalModal>;

const ModalTriggerPanel: React.FC = () => {
  const { openAlert, openConfirm, openPrompt } = useModalStore();

  const handleAlert = async () => {
    await openAlert(
      'This is a modern, custom system alert replacement that is fully keyboard accessible.',
      'Notification'
    );
    console.log('Alert closed');
  };

  const handleConfirm = async () => {
    const result = await openConfirm(
      'Are you sure you want to perform this action? This operation cannot be undone.',
      'Confirm Action'
    );
    console.log('Confirm result:', result);
  };

  const handlePrompt = async () => {
    const result = await openPrompt(
      'Please enter the new name for the object:',
      'Default Item Name',
      'Rename Object'
    );
    console.log('Prompt result:', result);
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-card border border-border rounded-xl shadow-lg max-w-sm w-full">
      <h3 className="text-md font-semibold text-foreground mb-2">GlobalModal Controller</h3>
      <p className="text-xs text-muted-foreground text-center mb-4">
        Click any button to trigger the global modal. Press Enter to confirm, Escape to cancel.
      </p>
      <div className="flex flex-col space-y-2 w-full">
        <button
          onClick={handleAlert}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
        >
          Trigger Alert
        </button>
        <button
          onClick={handleConfirm}
          className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors"
        >
          Trigger Confirm
        </button>
        <button
          onClick={handlePrompt}
          className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
        >
          Trigger Prompt
        </button>
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: () => (
    <>
      <ModalTriggerPanel />
      <GlobalModal />
    </>
  ),
};
