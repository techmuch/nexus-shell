import { Modal, type ModalProps } from '../components/widgets/Modal';
import { useModalStore } from '../core/services/ModalStoreService';
import { useSingleton } from '../lib/singleton';

export type ConnectedModalProps = Omit<
  ModalProps,
  'open' | 'type' | 'title' | 'message' | 'defaultValue' | 'onConfirm' | 'onCancel' | 'children'
>;

/**
 * {@link Modal} bound to `useModalStore`.
 *
 * `ShellLayout` mounts one for you. Mounting another is harmless: only one
 * instance renders, so a dialog is never drawn twice. Outside `ShellLayout`,
 * mount this once near the root of your app. It renders whichever dialog the
 * store has open and resolves the store's pending promise on dismissal, which
 * is what lets any code `await useModalStore.getState().openConfirm(...)`
 * without holding a component reference.
 *
 * Resolution values follow the store's contract: `prompt` resolves to the text
 * or `null`, `confirm` to a boolean, `alert` to `undefined`.
 */
export const ConnectedModal = (props: ConnectedModalProps) => {
  const { isOpen, type, title, message, defaultValue, close, render, size, closeOnBackdrop } = useModalStore();
  const live = useSingleton('nexus.modal');

  const handleConfirm = (value?: string) => {
    if (type === 'prompt') close(value ?? '');
    else if (type === 'confirm') close(true);
    else close();
  };

  const handleCancel = () => {
    if (render) close(undefined);
    else if (type === 'prompt') close(null);
    else if (type === 'confirm') close(false);
    else close();
  };

  if (!live) return null;

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
      size={render ? size : props.size}
      closeOnBackdrop={render ? closeOnBackdrop : props.closeOnBackdrop}
    >
      {render ? render((value) => close(value)) : undefined}
    </Modal>
  );
};
