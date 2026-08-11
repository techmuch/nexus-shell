import { Modal, type ModalProps } from '../components/widgets/Modal';
import { useModalStore } from '../core/services/ModalStoreService';

export type ConnectedModalProps = Omit<
  ModalProps,
  'open' | 'type' | 'title' | 'message' | 'defaultValue' | 'onConfirm' | 'onCancel'
>;

/**
 * {@link Modal} bound to `useModalStore`.
 *
 * Mount this once near the root of your app. It renders whichever dialog the
 * store has open and resolves the store's pending promise on dismissal, which
 * is what lets any code `await useModalStore.getState().openConfirm(...)`
 * without holding a component reference.
 *
 * Resolution values follow the store's contract: `prompt` resolves to the text
 * or `null`, `confirm` to a boolean, `alert` to `undefined`.
 */
export const ConnectedModal = (props: ConnectedModalProps) => {
  const { isOpen, type, title, message, defaultValue, close } = useModalStore();

  const handleConfirm = (value?: string) => {
    if (type === 'prompt') close(value ?? '');
    else if (type === 'confirm') close(true);
    else close();
  };

  const handleCancel = () => {
    if (type === 'prompt') close(null);
    else if (type === 'confirm') close(false);
    else close();
  };

  return (
    <Modal
      {...props}
      open={isOpen}
      type={type}
      title={title}
      message={message}
      defaultValue={defaultValue}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
};
