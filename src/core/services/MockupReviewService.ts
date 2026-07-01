import { create } from 'zustand';
import { Node, Edge } from 'reactflow';
import {
  defaultImplementationPlan,
  initialViews,
  initialNodes,
  initialEdges
} from './mockup-reviewer/MockupFixtures';

export interface IMockupAnnotation {
  id: string;
  type: 'stroke' | 'rect' | 'circle' | 'arrow' | 'comment';
  color: string;
  points?: { x: number; y: number }[]; // Freehand stroke path
  x?: number; // % x position on the container
  y?: number; // % y position on the container
  width?: number; // % width
  height?: number; // % height
  text?: string; // Comment description or shape text label
  elementSelector?: string; // CSS selector of target element for comment tethering
  versionId: string;
}

export interface IMockupVersion {
  id: string;
  label: string;
  timestamp: string;
  htmlContent: string;
  annotations: IMockupAnnotation[];
}

export interface IMockupView {
  id: string;
  name: string;
  description?: string;
  activeVersionId: string;
  versions: IMockupVersion[];
  parentId?: string | null;
}

interface MockupReviewState {
  views: IMockupView[];
  activeViewId: string | null;
  compareVersionId: string | null;
  nodes: Node[];
  edges: Edge[];
  implementationPlan: string;
  setActiveViewId: (id: string | null) => void;
  setActiveVersionId: (viewId: string, versionId: string) => void;
  setCompareVersionId: (versionId: string | null) => void;
  setViewParentId: (viewId: string, parentId: string | null) => void;
  addAnnotation: (viewId: string, versionId: string, annotation: Omit<IMockupAnnotation, 'versionId'>) => void;
  undoAnnotation: (viewId: string, versionId: string) => void;
  deleteAnnotation: (viewId: string, versionId: string, annotationId: string) => void;
  updateAnnotationText: (viewId: string, versionId: string, annotationId: string, text: string) => void;
  addMockupView: (name: string, description?: string, htmlContent?: string) => string;
  addMockupVersion: (viewId: string, label: string, htmlContent: string) => string;
  updateWorkflow: (nodes: Node[], edges: Edge[]) => void;
  setImplementationPlan: (plan: string) => void;
  generateImplementationPlanAction: () => void;
  refineImplementationPlanAction: (refinementPrompt: string) => void;
  exportHistoryJson: () => string;
}

export const useMockupReviewStore = create<MockupReviewState>((set, get) => ({
  views: initialViews,
  activeViewId: 'view-login',
  compareVersionId: null,
  nodes: initialNodes,
  edges: initialEdges,
  implementationPlan: defaultImplementationPlan,

  setActiveViewId: (id) => {
    set({
      activeViewId: id,
      compareVersionId: null, // Reset comparison when switching screens
      nodes: get().nodes.map(n => ({
        ...n,
        style: {
          ...n.style,
          border: n.id === id ? '2px solid #38bdf8' : '1px solid #334155'
        }
      }))
    });
  },

  setActiveVersionId: (viewId, versionId) => {
    set((state) => ({
      views: state.views.map((view) => {
        if (view.id === viewId) {
          return { ...view, activeVersionId: versionId };
        }
        return view;
      }),
      compareVersionId: null // Reset compare state when version changes
    }));
  },

  setCompareVersionId: (versionId) => set({ compareVersionId: versionId }),
  
  setViewParentId: (viewId, parentId) => {
    set((state) => ({
      views: state.views.map((v) => (v.id === viewId ? { ...v, parentId } : v))
    }));
  },

  addAnnotation: (viewId, versionId, annotation) => {
    set((state) => ({
      views: state.views.map((view) => {
        if (view.id === viewId) {
          return {
            ...view,
            versions: view.versions.map((v) => {
              if (v.id === versionId) {
                return {
                  ...v,
                  annotations: [...v.annotations, { ...annotation, versionId }]
                };
              }
              return v;
            })
          };
        }
        return view;
      })
    }));
  },

  undoAnnotation: (viewId, versionId) => {
    set((state) => ({
      views: state.views.map((view) => {
        if (view.id === viewId) {
          return {
            ...view,
            versions: view.versions.map((v) => {
              if (v.id === versionId) {
                return {
                  ...v,
                  annotations: v.annotations.slice(0, -1)
                };
              }
              return v;
            })
          };
        }
        return view;
      })
    }));
  },

  deleteAnnotation: (viewId, versionId, annotationId) => {
    set((state) => ({
      views: state.views.map((view) => {
        if (view.id === viewId) {
          return {
            ...view,
            versions: view.versions.map((v) => {
              if (v.id === versionId) {
                return {
                  ...v,
                  annotations: v.annotations.filter((a) => a.id !== annotationId)
                };
              }
              return v;
            })
          };
        }
        return view;
      })
    }));
  },

  updateAnnotationText: (viewId, versionId, annotationId, text) => {
    set((state) => ({
      views: state.views.map((view) => {
        if (view.id === viewId) {
          return {
            ...view,
            versions: view.versions.map((v) => {
              if (v.id === versionId) {
                return {
                  ...v,
                  annotations: v.annotations.map((a) => {
                    if (a.id === annotationId) {
                      return { ...a, text };
                    }
                    return a;
                  })
                };
              }
              return v;
            })
          };
        }
        return view;
      })
    }));
  },

  addMockupView: (name, description, htmlContent) => {
    const viewId = `view-${name.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(Math.random() * 1000)}`;
    const versionId = `${viewId}-v1`;
    const newVersion: IMockupVersion = {
      id: versionId,
      label: 'v1.0',
      timestamp: new Date().toISOString(),
      htmlContent: htmlContent || '<div style="padding: 2rem; color: #94a3b8; text-align: center;">Empty Mockup Panel</div>',
      annotations: []
    };
    const newView: IMockupView = {
      id: viewId,
      name,
      description,
      activeVersionId: versionId,
      versions: [newVersion]
    };

    set((state) => {
      // Add node to workflow layout
      const offset = state.nodes.length * 200;
      const newNode: Node = {
        id: viewId,
        type: 'default',
        data: { label: `📄 ${name}` },
        position: { x: 100 + offset % 800, y: 150 + Math.floor(offset / 800) * 100 },
        style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '6px', padding: '10px' }
      };

      return {
        views: [...state.views, newView],
        activeViewId: viewId,
        nodes: [...state.nodes, newNode]
      };
    });

    return viewId;
  },

  addMockupVersion: (viewId, label, htmlContent) => {
    const versionId = `${viewId}-v${Math.floor(Math.random() * 1000)}`;
    const newVersion: IMockupVersion = {
      id: versionId,
      label,
      timestamp: new Date().toISOString(),
      htmlContent,
      annotations: []
    };

    set((state) => ({
      views: state.views.map((view) => {
        if (view.id === viewId) {
          return {
            ...view,
            activeVersionId: versionId,
            versions: [...view.versions, newVersion]
          };
        }
        return view;
      })
    }));

    return versionId;
  },

  updateWorkflow: (nodes, edges) => set({ nodes, edges }),
  
  setImplementationPlan: (plan) => set({ implementationPlan: plan }),

  generateImplementationPlanAction: () => {
    const { views, edges } = get();
    
    let md = `# System Implementation Plan\n\n`;
    md += `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n\n`;
    
    md += `## 1. System Architecture & Workflow mapping\n\n`;
    md += `### Workflow Screen Views\n`;
    views.forEach((view) => {
      const parentName = view.parentId ? (views.find((v) => v.id === view.parentId)?.name || 'Unknown Base') : null;
      md += `- **${view.name}** (ID: \`${view.id}\`)${parentName ? ` *inherits layout template from **${parentName}***` : ''}\n`;
      if (view.description) {
        md += `  *Description: ${view.description}*\n`;
      }
    });
    md += `\n`;

    md += `### Navigation Transitions\n`;
    const transitions = edges.filter((e) => !e.id.includes('inherit'));
    if (transitions.length === 0) {
      md += `*No screen transitions mapped yet.*\n`;
    } else {
      transitions.forEach((edge) => {
        const src = views.find((v) => v.id === edge.source)?.name || edge.source;
        const tgt = views.find((v) => v.id === edge.target)?.name || edge.target;
        md += `- **${src}** → **${tgt}** ${edge.label ? `via "*${edge.label}*"` : ''}\n`;
      });
    }
    md += `\n`;

    md += `### Screen Template Inheritance\n`;
    const inheritances = views.filter((v) => v.parentId);
    if (inheritances.length === 0) {
      md += `*No layout template inheritances declared.*\n`;
    } else {
      inheritances.forEach((view) => {
        const parent = views.find((v) => v.id === view.parentId);
        md += `- **${view.name}** inherits structure from template **${parent?.name || 'Base View'}**\n`;
      });
    }
    md += `\n`;

    md += `## 2. Component Design & Review Annotations\n\n`;
    views.forEach((view) => {
      md += `### Screen: ${view.name}\n`;
      const activeVer = view.versions.find((v) => v.id === view.activeVersionId);
      if (!activeVer) {
        md += `*No revision version exists.*\n\n`;
        return;
      }
      md += `- **Active Version**: \`${activeVer.label}\`\n`;
      
      const comments = activeVer.annotations.filter((a) => a.type === 'comment');
      const drawings = activeVer.annotations.filter((a) => a.type !== 'comment');
      
      if (comments.length === 0 && drawings.length === 0) {
        md += `- **Status**: Clean. No review annotations recorded on canvas.\n\n`;
      } else {
        if (comments.length > 0) {
          md += `- **Usability & Style Feedback Items**:\n`;
          comments.forEach((c, idx) => {
            md += `  - [ ] **Item #${idx + 1}**: "${c.text}" ${c.elementSelector ? `*(Tethered CSS Selector: \`${c.elementSelector}\`)*` : ''}\n`;
          });
        }
        if (drawings.length > 0) {
          md += `- **Visual Mockup Overlay Drawings**: ${drawings.length} graphical markup overlays exist.\n`;
        }
        md += `\n`;
      }
    });

    md += `## 3. Automated Code-Gen Recommendations\n\n`;
    md += `- **Decoupled Registries**: Register all workflow screens in \`componentRegistry.ts\` and navigation paths in \`commandRegistry.ts\`.\n`;
    md += `- **State Synchronization**: Integrate layout nodes with global state variables in \`useLayoutStore.ts\`.\n`;
    md += `- **Theme Integrity**: Match all interactive components with tailwind color system (HlS custom variables).\n`;

    set({ implementationPlan: md });
  },

  refineImplementationPlanAction: (refinementPrompt) => {
    let currentPlan = get().implementationPlan;
    
    // Custom simulated AI response based on keywords
    let recommendation = '';
    const cleanPrompt = refinementPrompt.toLowerCase();
    
    if (cleanPrompt.includes('test') || cleanPrompt.includes('qa')) {
      recommendation = `### Copilot Requirement Integration: Testing & QA\n- [ ] **Playwright Test coverage**: Write E2E and visual tests in \`tests/mockup-reviewer.spec.ts\` verifying navigation paths, and visual regressions across simulated viewports.\n`;
    } else if (cleanPrompt.includes('responsive') || cleanPrompt.includes('mobile') || cleanPrompt.includes('viewport')) {
      recommendation = `### Copilot Requirement Integration: Responsiveness\n- [ ] **Mobile Breakpoints**: Verify layout wrapping under 768px viewports. Enable flex wrapping on header elements and collapse sidebar navigation into hamburger dropdowns.\n`;
    } else if (cleanPrompt.includes('security') || cleanPrompt.includes('xss') || cleanPrompt.includes('sanitize')) {
      recommendation = `### Copilot Requirement Integration: Security compliance\n- [ ] **XSS Sanitization**: Inject DOMPurify boundaries inside the HTML shadow DOM component and verify iframe sandboxing limits execute correctly.\n`;
    } else if (cleanPrompt.includes('auth') || cleanPrompt.includes('login') || cleanPrompt.includes('token')) {
      recommendation = `### Copilot Requirement Integration: Authentication Flow\n- [ ] **Auth Token storage**: Bind login fields to secure cookie sessions. Support OAuth redirections and session timeout intervals (15-min idle).\n`;
    } else {
      recommendation = `### Copilot Requirement Integration: Custom Spec\n- [ ] **AI Recommendation**: Refined plan with: "*${refinementPrompt}*". Ensure compliance with active Tailwind tokens and decouple service controllers.\n`;
    }
    
    set({
      implementationPlan: currentPlan + `\n` + recommendation
    });
  },

  exportHistoryJson: () => {
    const historyData = get().views.map((view) => ({
      screenId: view.id,
      screenName: view.name,
      revisions: view.versions.map((v) => ({
        revisionId: v.id,
        label: v.label,
        timestamp: v.timestamp,
        comments: v.annotations
          .filter((ann) => ann.type === 'comment')
          .map((ann) => ({
            id: ann.id,
            text: ann.text,
            elementSelector: ann.elementSelector,
            coords: { x: ann.x, y: ann.y }
          })),
        drawingsCount: v.annotations.filter((ann) => ann.type !== 'comment').length
      }))
    }));

    return JSON.stringify(historyData, null, 2);
  }
}));
