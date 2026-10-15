import React from 'react';

export type ComponentConstructor = React.ComponentType<any>;

/** Options for {@link ComponentRegistry.alias}. */
export interface ComponentAliasOptions {
  /**
   * Retitle tabs that are rewritten from the old id. Omit to keep whatever
   * title the saved tab had.
   */
  title?: string;
}

export class ComponentRegistry {
  private components = new Map<string, ComponentConstructor>();
  private aliases = new Map<string, { to: string; title?: string }>();

  /**
   * Register a component with a unique ID.
   * This ID is what you use in your FlexLayout models.
   */
  register(id: string, component: ComponentConstructor): void {
    if (this.components.has(id)) {
      console.warn(`Component with ID "${id}" is already registered.`);
    }
    this.components.set(id, component);
  }

  /** Remove every component and alias. For tests; see `resetShell`. */
  clear(): void {
    this.components.clear();
    this.aliases.clear();
  }

  /** Remove a registration. Aliases pointing at it are left in place. */
  unregister(id: string): void {
    this.components.delete(id);
  }

  /**
   * Declare that `from` is an old name for `to`.
   *
   * Layouts are persisted by component id, so renaming a component strands
   * every saved tab under the old one. An alias resolves the old id wherever
   * the shell looks one up — rendering, `addTab`, `workspace.find` — and the
   * shell rewrites saved tabs to the new id when it mounts, so the old name
   * eventually disappears from storage rather than being registered forever.
   *
   * @example
   * ```ts
   * componentRegistry.register('desk', Desk);
   * componentRegistry.alias('mail', 'desk', { title: 'Desk' });
   * ```
   */
  alias(from: string, to: string, options: ComponentAliasOptions = {}): void {
    if (from === to) return;
    this.aliases.set(from, { to, title: options.title });
  }

  /**
   * Follow aliases from `id` to the id it now names. Returns `id` itself when
   * it is not an alias. Cycles stop at the first repeat.
   */
  resolve(id: string): string {
    const seen = new Set<string>();
    let current = id;
    while (this.aliases.has(current) && !seen.has(current)) {
      seen.add(current);
      current = this.aliases.get(current)!.to;
    }
    return current;
  }

  /** The alias record for `id`, if it is one. */
  getAlias(id: string): { to: string; title?: string } | undefined {
    if (!this.aliases.has(id)) return undefined;
    // Along a chain (old → older name → current), the title declared nearest
    // the current id is the current one.
    let title: string | undefined;
    const seen = new Set<string>();
    let current = id;
    while (this.aliases.has(current) && !seen.has(current)) {
      seen.add(current);
      const alias = this.aliases.get(current)!;
      if (alias.title !== undefined) title = alias.title;
      current = alias.to;
    }
    return { to: current, title };
  }

  /**
   * Retrieve a registered component by its ID, following aliases.
   */
  get(id: string): ComponentConstructor | undefined {
    return this.components.get(id) ?? this.components.get(this.resolve(id));
  }

  /** Whether `id`, or what it aliases, is registered. */
  has(id: string): boolean {
    return this.get(id) !== undefined;
  }

  /**
   * Get all registered component IDs.
   */
  getRegisteredIds(): string[] {
    return Array.from(this.components.keys());
  }
}

export const componentRegistry = new ComponentRegistry();
