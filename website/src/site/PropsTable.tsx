import { cn } from 'nexus-shell';
import api from '@site/generated/api.json';

export interface ApiProp {
  name: string;
  required: boolean;
  type: string;
  description: string;
  default: string | null;
}

export interface ApiComponent {
  name: string;
  file: string;
  description: string;
  example: string | null;
  props: ApiProp[];
}

const COMPONENTS = (api as { components: ApiComponent[] }).components;

export const apiFor = (name: string): ApiComponent | undefined =>
  COMPONENTS.find((c) => c.name === name);

export const allApi = COMPONENTS;

/** Render inline `code` spans in a prop description. */
const withCode = (text: string) =>
  text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith('`') && part.endsWith('`') ? (
      <code
        key={i}
        className="font-mono text-[11.5px] px-1 py-0.5 rounded bg-muted text-foreground"
      >
        {part.slice(1, -1)}
      </code>
    ) : (
      <span key={i}>{part}</span>
    ),
  );

export interface PropsTableProps {
  /** Component name, matching the generated API entry. */
  component: string;
}

/**
 * The props reference for one component, generated from its source at build
 * time by `website/scripts/generate-api.mjs`. Nothing here is hand-written, so
 * it cannot drift from the library.
 */
export const PropsTable = ({ component }: PropsTableProps) => {
  const entry = apiFor(component);

  if (!entry || entry.props.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        No props reference available for {component}.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Prop
            </th>
            <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Type
            </th>
            <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">
              Default
            </th>
            <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {entry.props.map((prop, i) => (
            <tr
              key={prop.name}
              className={cn(
                'align-top border-b border-border/50 last:border-0',
                i % 2 === 1 && 'bg-muted/20',
              )}
            >
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="font-mono text-[12px] font-semibold text-foreground">
                  {prop.name}
                </span>
                {prop.required && (
                  <span
                    title="Required"
                    className="ml-1 text-destructive font-bold"
                    aria-label="required"
                  >
                    *
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <code className="font-mono text-[11.5px] text-sky-600 dark:text-sky-400 break-all">
                  {prop.type}
                </code>
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                {prop.default ? (
                  <code className="font-mono text-[11.5px] text-muted-foreground">
                    {prop.default}
                  </code>
                ) : (
                  <span className="text-muted-foreground/40">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-[13px] text-muted-foreground leading-relaxed max-w-md">
                {withCode(prop.description)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
