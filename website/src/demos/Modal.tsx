import { useState } from 'react';
import { Modal } from 'nexus-shell';

const Button = ({ onClick, children }: { onClick: () => void; children: string }) => (
  <button
    type="button"
    onClick={onClick}
    className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
  >
    {children}
  </button>
);

// #region prompt
export const Prompt = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('untitled.tsx');

  return (
    <div className="flex flex-col items-start gap-3">
      <Button onClick={() => setOpen(true)}>Rename file…</Button>
      <p className="text-[13px] text-muted-foreground">
        Current name: <code className="font-mono">{name}</code>
      </p>

      <Modal
        open={open}
        type="prompt"
        title="Rename file"
        message="Enter a new name for this file."
        defaultValue={name}
        // `prompt` hands back the input text; `confirm` and `alert` pass nothing.
        onConfirm={(value) => {
          if (value) setName(value);
          setOpen(false);
        }}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
};
// #endregion

// #region confirm
export const Confirm = () => {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-3">
      <Button onClick={() => setOpen(true)}>Delete 3 files…</Button>
      <p className="text-[13px] text-muted-foreground">{result ?? 'No decision yet.'}</p>

      <Modal
        open={open}
        type="confirm"
        title="Delete 3 files?"
        message="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Keep"
        onConfirm={() => {
          setResult('Deleted.');
          setOpen(false);
        }}
        // Escape, backdrop click and the close button all route here.
        onCancel={() => {
          setResult('Cancelled.');
          setOpen(false);
        }}
      />
    </div>
  );
};
// #endregion

// #region alert
export const Alert = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-start gap-3">
      <Button onClick={() => setOpen(true)}>Show build error</Button>

      <Modal
        open={open}
        type="alert"
        title="Build failed"
        message={'tsc exited with code 2.\nSee the terminal for details.'}
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
};
// #endregion
