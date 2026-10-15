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
  /**
   * Arbitrary dialog content — a form, an editor, a review panel. Replaces
   * the message, icon, prompt input and default buttons; supply your own
   * actions with `footer`. Enter is not intercepted, so textareas work.
   */
  children?: React.ReactNode;
  /** Action row for a content dialog. Omit for none. */
  footer?: React.ReactNode;
  /** Dialog width. Defaults to `"md"`. */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether a click on the backdrop cancels. Defaults to `true`. */
  closeOnBackdrop?: boolean;
  /** Extra classes merged onto the dialog surface. */
  className?: string;
}

const SIZES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[calc(100vw-4rem)] h-[calc(100vh-4rem)]',
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

const focusablesIn = (root: HTMLElement): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));

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
 * A centered modal dialog covering the three common blocking interactions —
 * alert, confirm and prompt — or, given `children`, any content at all.
 *
 * Keyboard focus is trapped inside while open and returned to whatever had it
 * when the dialog closes. In a content dialog, the first element marked
 * `data-autofocus` (else the first focusable one) receives focus.
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
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  className,
}: ModalProps) => {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const isContent = children !== undefined;

  // Return focus to where it was when the dialog opened.
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    return () => {
      if (previous && typeof previous.focus === 'function' && document.contains(previous)) previous.focus();
    };
  }, [open]);

  // A content dialog focuses its first field; the presets focus themselves.
  useEffect(() => {
    if (!open || !isContent || !dialogRef.current) return;
    const root = dialogRef.current;
    const target =
      root.querySelector<HTMLElement>('[data-autofocus]') ??
      focusablesIn(root).find((el) => el.getAttribute('aria-label') !== 'Close') ??
      root;
    target.focus();
  }, [open, isContent]);

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
    // Tab cycles within the dialog rather than escaping to the page behind.
    if (e.key === 'Tab' && dialogRef.current) {
      const items = focusablesIn(dialogRef.current);
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
      return;
    }
    if (e.key !== 'Enter' || isContent) return;
    e.preventDefault();
    confirm();
  };

  const Icon = ICONS[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background/80 backdrop-blur-sm transition-all duration-300"
      onClick={closeOnBackdrop ? onCancel : undefined}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative flex flex-col w-full p-6 bg-card border border-border shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 ring-1 ring-white/10 focus:outline-none',
          SIZES[size],
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

        {isContent ? (
          <>
            <h2 className="text-lg font-semibold tracking-tight pr-8 mb-4">{title}</h2>
            <div className="flex-1 min-h-0 overflow-auto">{children}</div>
            {footer && <div className="flex items-center justify-end gap-3 mt-6">{footer}</div>}
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};
