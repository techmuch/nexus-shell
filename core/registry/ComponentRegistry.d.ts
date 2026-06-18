import { default as React } from '../../../node_modules/react';

export type ComponentConstructor = React.ComponentType<any>;
export declare class ComponentRegistry {
    private components;
    /**
     * Register a component with a unique ID.
     * This ID is what you use in your FlexLayout models.
     */
    register(id: string, component: ComponentConstructor): void;
    /**
     * Retrieve a registered component by its ID.
     */
    get(id: string): ComponentConstructor | undefined;
    /**
     * Get all registered component IDs.
     */
    getRegisteredIds(): string[];
}
export declare const componentRegistry: ComponentRegistry;
