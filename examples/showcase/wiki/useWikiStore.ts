import { create } from 'zustand';

export interface WikiPage {
  id: string;
  title: string;
  content: string;
  status: 'Published' | 'Draft' | 'Outdated';
  tags: string[];
}

export interface WikiCommit {
  id: string;
  pageId: string;
  timestamp: string;
  author: string;
  message: string;
  diffSummary: string; // LLM generated summary
  contentSnapshot: string;
}

interface WikiState {
  pages: Record<string, WikiPage>;
  commits: Record<string, WikiCommit[]>; // pageId -> commits
  activePageId: string | null;
  
  // Actions
  setActivePage: (id: string | null) => void;
  updatePageContent: (id: string, newContent: string) => void;
  commitPageChanges: (id: string, author: string, message?: string) => Promise<void>;
  rollbackToCommit: (pageId: string, commitId: string) => void;
  
  // LLM Mock Methods
  generateCompletion: (context: string, prompt: string) => Promise<string>;
  summarizeDiff: (oldContent: string, newContent: string) => Promise<string>;
  semanticSearch: (query: string) => Promise<{ pageId: string; snippet: string }[]>;
}

// Initial mock data
const INITIAL_PAGES: Record<string, WikiPage> = {
  'p-1': { id: 'p-1', title: 'Home', content: '# Welcome to the Wiki\nThis is the central hub for knowledge.', status: 'Published', tags: ['home', 'index'] },
  'p-2': { id: 'p-2', title: 'Architecture Diagram', content: '# Architecture\nWe use a React frontend with a node backend.', status: 'Draft', tags: ['engineering', 'architecture'] },
  'p-3': { id: 'p-3', title: 'Onboarding Guide', content: '# Onboarding\nStep 1: Get coffee. Step 2: Read code.', status: 'Outdated', tags: ['hr', 'onboarding'] },
};

const INITIAL_COMMITS: Record<string, WikiCommit[]> = {
  'p-1': [
    { id: 'c-1', pageId: 'p-1', timestamp: '2026-06-20T10:00:00Z', author: 'Alice', message: 'Initial commit', diffSummary: 'Created the home page.', contentSnapshot: '# Welcome to the Wiki' },
    { id: 'c-2', pageId: 'p-1', timestamp: '2026-06-21T14:30:00Z', author: 'Bob', message: 'Added subtitle', diffSummary: 'Added a welcome subtitle to the home page.', contentSnapshot: '# Welcome to the Wiki\nThis is the central hub for knowledge.' },
  ],
};

export const useWikiStore = create<WikiState>((set, get) => ({
  pages: INITIAL_PAGES,
  commits: INITIAL_COMMITS,
  activePageId: 'p-1',

  setActivePage: (id) => set({ activePageId: id }),

  updatePageContent: (id, newContent) => set((state) => ({
    pages: {
      ...state.pages,
      [id]: { ...state.pages[id], content: newContent, status: 'Draft' }
    }
  })),

  commitPageChanges: async (id, author, message) => {
    const state = get();
    const page = state.pages[id];
    if (!page) return;

    const commitsForPage = state.commits[id] || [];
    const lastCommit = commitsForPage[commitsForPage.length - 1];
    
    // Simulate LLM summary if no message
    let finalMessage = message;
    let diffSummary = 'Minor text changes.';
    if (!finalMessage) {
       diffSummary = await state.summarizeDiff(lastCommit?.contentSnapshot || '', page.content);
       finalMessage = 'Update ' + page.title;
    }

    const newCommit: WikiCommit = {
      id: `c-${Date.now()}`,
      pageId: id,
      timestamp: new Date().toISOString(),
      author,
      message: finalMessage,
      diffSummary,
      contentSnapshot: page.content,
    };

    set((state) => ({
      pages: { ...state.pages, [id]: { ...state.pages[id], status: 'Published' } },
      commits: { ...state.commits, [id]: [...(state.commits[id] || []), newCommit] }
    }));
  },

  rollbackToCommit: (pageId, commitId) => set((state) => {
    const commit = state.commits[pageId]?.find(c => c.id === commitId);
    if (!commit) return state;
    return {
      pages: {
        ...state.pages,
        [pageId]: { ...state.pages[pageId], content: commit.contentSnapshot, status: 'Published' }
      }
    };
  }),

  // Mock LLM Functions
  generateCompletion: async (context, prompt) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`[AI Generated based on "${prompt}"]: Consider adding detailed structural diagrams or references to the core logic here. The current context mentions ${context.split(' ')[0]}...`);
      }, 1000); // Simulate network delay
    });
  },

  summarizeDiff: async (oldContent, newContent) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`AI Summary: The content grew from ${oldContent.length} to ${newContent.length} characters, adding more descriptive context.`);
      }, 800);
    });
  },

  semanticSearch: async (query) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Just return dummy data for storybook demo
        const state = get();
        const results = Object.values(state.pages)
          .filter(p => p.title.toLowerCase().includes(query.toLowerCase()) || p.content.toLowerCase().includes(query.toLowerCase()))
          .map(p => ({
            pageId: p.id,
            snippet: p.content.substring(0, 50) + '...',
          }));
        resolve(results.length > 0 ? results : [{ pageId: 'p-1', snippet: '[AI] Found relevant topic in Home...' }]);
      }, 1200);
    });
  }
}));
