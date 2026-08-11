/**
 * DialogueMapRepository adapter class.
 * Encapsulates the REST API network requests for loading and saving dialogue maps.
 */
export class DialogueMapRepository {
  /**
   * Loads the map content by retrieving the file list from `/api/files`
   * and recursively locating the file matching the specified map ID.
   */
  static async loadMap(mapId: string): Promise<string | null> {
    const res = await fetch('/api/files');
    if (!res.ok) {
      throw new Error(`Failed to load maps list: ${res.statusText}`);
    }
    const files = await res.json() || [];

    const findContent = (arr: any[]): string | null => {
      for (const f of arr) {
        if (f.id === mapId) return f.content;
        if (f.children) {
          const found = findContent(f.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findContent(files);
  }

  /**
   * Saves the map nodes and edges to `/api/maps/content`.
   */
  static async saveMap(mapId: string, nodes: any[], edges: any[]): Promise<void> {
    const res = await fetch('/api/maps/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: mapId,
        content: JSON.stringify({ nodes, edges })
      })
    });
    if (!res.ok) {
      throw new Error(`Failed to save map content: ${res.statusText}`);
    }
  }
}
