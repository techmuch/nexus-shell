import React from 'react';

export type ComponentConstructor = React.ComponentType<any>;

export class ComponentRegistry {
  private components = new Map<string, ComponentConstructor>();

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

  /**
   * Retrieve a registered component by its ID.
   */
  get(id: string): ComponentConstructor | undefined {
    return this.components.get(id);
  }

  /**
   * Get all registered component IDs.
   */
  getRegisteredIds(): string[] {
    return Array.from(this.components.keys());
  }
}

export const componentRegistry = new ComponentRegistry();
