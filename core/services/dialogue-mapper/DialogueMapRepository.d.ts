/**
 * DialogueMapRepository adapter class.
 * Encapsulates the REST API network requests for loading and saving dialogue maps.
 */
export declare class DialogueMapRepository {
    /**
     * Loads the map content by retrieving the file list from `/api/files`
     * and recursively locating the file matching the specified map ID.
     */
    static loadMap(mapId: string): Promise<string | null>;
    /**
     * Saves the map nodes and edges to `/api/maps/content`.
     */
    static saveMap(mapId: string, nodes: any[], edges: any[]): Promise<void>;
}
