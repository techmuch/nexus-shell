import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, HelpCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/cn';

/**
 * Which of the three dialog shapes to render.
 *
 * - `alert` — a single OK button.
 * - `confirm` — Cancel and Confirm.
 * - `prompt` — Cancel and Confirm, plus a text input.
 */
export type ModalType = 'alert' | 'confirm' | 'prompt';

export interface ModalProps {
  /** Whether the dialog is mounted. Nothing renders when `false`. */
  open: boolean;
  /** Dialog shape. Defaults to `"alert"`. */
  type?: ModalType;
  /** Heading text. */
  title: string;
  /** Body text. Newlines are preserved. */
  message?: string;
  /** Initial value of the input when `type` is `"prompt"`. */
  defaultValue?: string;
  /**
   * Called on Confirm/OK and on Enter. Receives the input text for `prompt`,
   * and `undefined` for `alert` and `confirm`.
   */
  onConfirm?: (value?: string) => void;
  /** Called on Cancel, on the close button, on Escape, and on backdrop click. */
  onCancel?: () => void;
  /** Label for the confirm button. Defaults to `"OK"` / `"Confirm"` by `type`. */
  confirmLabel?: string;
  /** Label for the cancel button. Defaults to `"Cancel"`. */
  cancelLabel?: string;
  /** Placeholder for the prompt input. */
  placeholder?: string;
  /** Extra classes merged onto the dialog surface. */
  className?: string;
}

const ICONS: Record<ModalType, typeof Info> = {
  alert: AlertCircle,
  confirm: HelpCircle,
  prompt: Info,
};

const ICON_COLORS: Record<ModalType, string> = {
  alert: 'text-destructive',
  confirm: 'text-amber-500',
  prompt: 'text-blue-500',
};

/**
 * A centered modal dialog covering the three common blocking interactions:
 * alert, confirm and prompt.
 *
 * Fully controlled — it owns only the prompt's draft text. Escape, backdrop
 * click and the close button all route to `onCancel`; Enter routes to
 * `onConfirm`. For the promise-based variant driven by `useModalStore` (so you
 * can `await openConfirm(...)` from anywhere), see `ConnectedModal`.
 *
 * @example
 * ```tsx
 * <Modal
 *   open={open}
 *   type="prompt"
 *   title="Rename file"
 *   message="Enter a new name."
 *   defaultValue="untitled.ts"
 *   onConfirm={(name) => rename(name)}
 *   onCancel={() => setOpen(false)}
 * />
 * ```
 */
export const Modal = ({
  open,
  type = 'alert',
  title,
  message,
  defaultValue = '',
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel = 'Cancel',
  placeholder = 'Enter value…',
  className,
}: ModalProps) => {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setValue(defaultValue);
    if (type !== 'prompt') return;
    const id = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 50);
    return () => window.clearTimeout(id);
  }, [open, type, defaultValue]);

  // Escape is bound at the document, not the dialog, so it works regardless of
  // where focus currently sits.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      onCancel?.();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const confirm = () => onConfirm?.(type === 'prompt' ? value : undefined);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    confirm();
  };

  const Icon = ICONS[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background/80 backdrop-blur-sm transition-all duration-300"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative flex flex-col w-full max-w-md p-6 bg-card border border-border shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 ring-1 ring-white/10',
          className,
        )}
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          className="absolute top-4 right-4 p-1 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <X size={18} />
        </button>

        <div className="flex items-start space-x-4 mb-4">
          <div className={cn('p-2 bg-muted rounded-full shrink-0', ICON_COLORS[type])}>
            <Icon size={24} />
          </div>
          <div className="flex-1 mt-1">
            <h2 className="text-lg font-semibold tracking-tight pr-6">{title}</h2>
            {message && (
              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                {message}
              </p>
            )}
          </div>
        </div>

        {type === 'prompt' && (
          <div className="mt-2 mb-4">
            <input
              ref={inputRef}
              type="text"
              aria-label={title}
              value={value}
              placeholder={placeholder}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
            />
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 mt-4">
          {type !== 'alert' && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={confirm}
            autoFocus={type !== 'prompt'}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {confirmLabel ?? (type === 'alert' ? 'OK' : 'Confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};
