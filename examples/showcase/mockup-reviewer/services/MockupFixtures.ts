import { Node, Edge } from 'reactflow';
import { IMockupView } from '../MockupReviewService';

export const defaultImplementationPlan = `# System Implementation Plan

This plan is dynamically generated from the mapped workflows and mockups.

## 1. System Workflows & Transitions
Select **Generate Plan from Mockups** in the right panel to compile active screen transitions, generalization hierarchies, and annotated usability adjustments.
`;

// Pre-loaded high-fidelity mockups
export const defaultLoginHtmlV1 = `
<div style="font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; padding: 2rem; background: #0f172a; color: #f8fafc; border-radius: 8px;">
  <div style="width: 100%; max-width: 320px; background: #1e293b; padding: 2rem; border-radius: 8px; border: 1px border #334155; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
    <h2 id="login-title" style="margin-top: 0; text-align: center; color: #38bdf8; font-size: 1.5rem; font-weight: 700;">Nexus Login</h2>
    <p style="color: #94a3b8; font-size: 0.875rem; text-align: center; margin-bottom: 1.5rem;">Access the workbench dashboard</p>
    
    <label style="display: block; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #94a3b8; margin-bottom: 0.25rem;">Username</label>
    <input id="input-username" type="text" placeholder="admin" style="width: 100%; padding: 0.5rem; background: #0f172a; border: 1px solid #334155; border-radius: 4px; color: #f8fafc; margin-bottom: 1rem; box-sizing: border-box;" />
    
    <label style="display: block; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #94a3b8; margin-bottom: 0.25rem;">Password</label>
    <input id="input-password" type="password" placeholder="••••••••" style="width: 100%; padding: 0.5rem; background: #0f172a; border: 1px solid #334155; border-radius: 4px; color: #f8fafc; margin-bottom: 1.5rem; box-sizing: border-box;" />
    
    <button id="btn-login" style="width: 100%; padding: 0.625rem; background: #0284c7; border: none; border-radius: 4px; color: white; font-weight: 600; cursor: pointer; transition: background 0.2s;">Sign In</button>
  </div>
</div>
`;

export const defaultLoginHtmlV2 = `
<div style="font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; padding: 2rem; background: #0f172a; color: #f8fafc; border-radius: 8px;">
  <div style="width: 100%; max-width: 320px; background: #1e293b; padding: 2rem; border-radius: 8px; border: 1px solid #334155; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
    <h2 id="login-title" style="margin-top: 0; text-align: center; color: #6366f1; font-size: 1.5rem; font-weight: 700;">Nexus Shell Portal</h2>
    <p style="color: #94a3b8; font-size: 0.875rem; text-align: center; margin-bottom: 1.5rem;">Access the workbench dashboard</p>
    
    <label style="display: block; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #94a3b8; margin-bottom: 0.25rem;">Username</label>
    <input id="input-username" type="text" placeholder="admin" style="width: 100%; padding: 0.5rem; background: #0f172a; border: 1px solid #334155; border-radius: 4px; color: #f8fafc; margin-bottom: 1rem; box-sizing: border-box;" />
    
    <label style="display: block; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #94a3b8; margin-bottom: 0.25rem;">Password</label>
    <input id="input-password" type="password" placeholder="••••••••" style="width: 100%; padding: 0.5rem; background: #0f172a; border: 1px solid #334155; border-radius: 4px; color: #f8fafc; margin-bottom: 1.5rem; box-sizing: border-box;" />
    
    <button id="btn-login" style="width: 100%; padding: 0.625rem; background: #6366f1; border: none; border-radius: 4px; color: white; font-weight: 600; cursor: pointer; transition: background 0.2s;">Sign In</button>
    
    <div style="display: flex; justify-content: space-between; margin-top: 1rem; font-size: 0.75rem;">
      <a id="link-forgot-pass" href="#" style="color: #6366f1; text-decoration: none;">Forgot password?</a>
      <a id="link-request-access" href="#" style="color: #94a3b8; text-decoration: none;">Request Access</a>
    </div>
  </div>
</div>
`;

export const defaultDashboardHtml = `
<div style="font-family: system-ui, sans-serif; display: flex; flex-direction: column; min-height: 400px; background: #0f172a; color: #f8fafc; border-radius: 8px; overflow: hidden; border: 1px solid #1e293b;">
  <!-- Header -->
  <header style="background: #1e293b; padding: 1rem; border-b: 1px solid #334155; display: flex; justify-content: space-between; align-items: center;">
    <span id="dashboard-logo" style="font-weight: 700; color: #38bdf8;">Nexus Workbench</span>
    <div style="display: flex; gap: 1rem; align-items: center;">
      <span style="font-size: 0.875rem;">Welcome, Admin</span>
      <button id="btn-settings-trigger" style="background: transparent; border: none; cursor: pointer; font-size: 1rem; padding: 0.25rem; color: #94a3b8;">⚙️</button>
    </div>
  </header>
  
  <div style="display: flex; flex: 1;">
    <!-- Sidebar -->
    <aside style="width: 150px; background: #0f172a; border-right: 1px solid #1e293b; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
      <a id="sidebar-overview" href="#" style="color: #38bdf8; text-decoration: none; font-size: 0.875rem; font-weight: 500; padding: 0.5rem; background: #1e293b; border-radius: 4px;">Overview</a>
      <a id="sidebar-agents" href="#" style="color: #94a3b8; text-decoration: none; font-size: 0.875rem; padding: 0.5rem;">Agents</a>
      <a id="sidebar-analytics" href="#" style="color: #94a3b8; text-decoration: none; font-size: 0.875rem; padding: 0.5rem;">Analytics</a>
    </aside>
    
    <!-- Main content -->
    <main style="flex: 1; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem;">
      <h3 id="overview-heading" style="margin: 0; color: #f8fafc;">System Overview</h3>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
        <div style="background: #1e293b; padding: 1rem; border-radius: 6px; text-align: center; border: 1px solid #334155;">
          <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">Active Agents</div>
          <div id="stat-active-agents" style="font-size: 1.5rem; font-weight: 700; color: #38bdf8; margin-top: 0.25rem;">12</div>
        </div>
        <div style="background: #1e293b; padding: 1rem; border-radius: 6px; text-align: center; border: 1px solid #334155;">
          <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">Accuracy (Avg)</div>
          <div id="stat-accuracy" style="font-size: 1.5rem; font-weight: 700; color: #38bdf8; margin-top: 0.25rem;">92.4%</div>
        </div>
        <div style="background: #1e293b; padding: 1rem; border-radius: 6px; text-align: center; border: 1px solid #334155;">
          <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">Uptime</div>
          <div id="stat-uptime" style="font-size: 1.5rem; font-weight: 700; color: #38bdf8; margin-top: 0.25rem;">99.98%</div>
        </div>
      </div>
      
      <!-- Mock chart panel -->
      <div id="analytics-chart-panel" style="background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 1rem; flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 150px;">
        <span style="color: #94a3b8; font-size: 0.875rem;">Agent Performance (Historical Trend)</span>
        <div style="width: 100%; height: 100px; display: flex; align-items: flex-end; gap: 0.5rem; padding-top: 1rem; justify-content: center;">
          <div style="width: 20px; height: 40px; background: #0284c7; border-radius: 2px 2px 0 0;"></div>
          <div style="width: 20px; height: 55px; background: #0284c7; border-radius: 2px 2px 0 0;"></div>
          <div style="width: 20px; height: 60px; background: #0284c7; border-radius: 2px 2px 0 0;"></div>
          <div style="width: 20px; height: 80px; background: #0284c7; border-radius: 2px 2px 0 0;"></div>
          <div style="width: 20px; height: 95px; background: #38bdf8; border-radius: 2px 2px 0 0;"></div>
        </div>
      </div>
    </main>
  </div>
</div>
`;

export const defaultSettingsHtml = `
<div style="font-family: system-ui, sans-serif; display: flex; flex-direction: column; min-height: 400px; background: #0f172a; color: #f8fafc; border-radius: 8px; overflow: hidden; border: 1px solid #1e293b; padding: 2rem;">
  <div style="max-width: 450px; margin: 0 auto; width: 100%;">
    <h3 id="settings-title" style="margin-top: 0; color: #38bdf8; font-size: 1.25rem;">System Preferences</h3>
    <p style="color: #94a3b8; font-size: 0.875rem; margin-bottom: 1.5rem;">Modify active runtime configuration settings.</p>
    
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div>
        <label style="display: block; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #94a3b8; margin-bottom: 0.25rem;">Server Address</label>
        <input id="input-server" type="text" value="https://api.nexus.cloud" style="width: 100%; padding: 0.5rem; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #f8fafc; box-sizing: border-box;" />
      </div>
      
      <div>
        <label style="display: block; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #94a3b8; margin-bottom: 0.25rem;">Agent LLM Endpoint</label>
        <select id="select-model" style="width: 100%; padding: 0.5rem; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #f8fafc; box-sizing: border-box;">
          <option>gemini-1.5-pro-latest</option>
          <option>gemini-1.5-flash</option>
          <option>claude-3-opus</option>
        </select>
      </div>
      
      <div style="display: flex; gap: 1rem; align-items: center; margin-top: 0.5rem;">
        <input id="check-telemetry" type="checkbox" checked style="cursor: pointer;" />
        <label style="font-size: 0.875rem; color: #cbd5e1; cursor: pointer;">Send anonymized usage analytics telemetry</label>
      </div>
      
      <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
        <button id="btn-save-settings" style="flex: 1; padding: 0.625rem; background: #0284c7; border: none; border-radius: 4px; color: white; font-weight: 600; cursor: pointer;">Save Settings</button>
        <button id="btn-cancel-settings" style="padding: 0.625rem 1rem; background: #334155; border: none; border-radius: 4px; color: #f8fafc; font-weight: 600; cursor: pointer;">Cancel</button>
      </div>
    </div>
  </div>
</div>
`;

// Initial views with pre-loaded mockups and versions
export const initialViews: IMockupView[] = [
  {
    id: 'view-login',
    name: 'Login Portal',
    description: 'Initial user authentication portal screen.',
    activeVersionId: 'login-v2',
    versions: [
      {
        id: 'login-v1',
        label: 'v1.0',
        timestamp: '2026-06-05T10:00:00Z',
        htmlContent: defaultLoginHtmlV1,
        annotations: [
          {
            id: 'ann-login-title-v1',
            type: 'comment',
            color: '#ef4444',
            x: 48,
            y: 10,
            text: 'We should update the title to "Nexus Shell Portal" instead of "Nexus Login" to match branding.',
            elementSelector: '#login-title',
            versionId: 'login-v1',
          },
          {
            id: 'ann-login-button-v1',
            type: 'comment',
            color: '#eab308',
            x: 48,
            y: 78,
            text: 'Need to add link options for "Forgot password" and "Request access" underneath the sign in button.',
            elementSelector: '#btn-login',
            versionId: 'login-v1',
          }
        ]
      },
      {
        id: 'login-v2',
        label: 'v2.0 (Active)',
        timestamp: '2026-06-06T15:30:00Z',
        htmlContent: defaultLoginHtmlV2,
        annotations: [
          {
            id: 'ann-login-btn-v2',
            type: 'comment',
            color: '#22c55e',
            x: 48,
            y: 72,
            text: 'Looks great! Colors match the dark theme and links look clean.',
            elementSelector: '#btn-login',
            versionId: 'login-v2',
          }
        ]
      }
    ]
  },
  {
    id: 'view-dashboard',
    name: 'Dashboard Overview',
    description: 'Central analytics workbench statistics summary.',
    activeVersionId: 'dash-v1',
    versions: [
      {
        id: 'dash-v1',
        label: 'v1.0',
        timestamp: '2026-06-06T16:00:00Z',
        htmlContent: defaultDashboardHtml,
        annotations: [
          {
            id: 'ann-dash-stats',
            type: 'comment',
            color: '#3b82f6',
            x: 75,
            y: 28,
            text: 'Make sure these stats are dynamically fed by useLayoutStore and useChatStore.',
            elementSelector: '#stat-active-agents',
            versionId: 'dash-v1',
          },
          {
            id: 'ann-dash-settings',
            type: 'comment',
            color: '#ef4444',
            x: 95,
            y: 4,
            text: 'This button should trigger a navigation link to navigate directly to the settings screen.',
            elementSelector: '#btn-settings-trigger',
            versionId: 'dash-v1',
          }
        ]
      }
    ]
  },
  {
    id: 'view-settings',
    name: 'System Settings',
    description: 'System preferences configuration page.',
    activeVersionId: 'settings-v1',
    versions: [
      {
        id: 'settings-v1',
        label: 'v1.0',
        timestamp: '2026-06-06T17:15:00Z',
        htmlContent: defaultSettingsHtml,
        annotations: []
      }
    ]
  }
];

// Initial React Flow Nodes
export const initialNodes: Node[] = [
  {
    id: 'view-login',
    type: 'default',
    data: { label: '🔑 Login Portal' },
    position: { x: 100, y: 150 },
    style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #38bdf8', borderRadius: '6px', padding: '10px' }
  },
  {
    id: 'view-dashboard',
    type: 'default',
    data: { label: '📊 Dashboard Overview' },
    position: { x: 350, y: 150 },
    style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '6px', padding: '10px' }
  },
  {
    id: 'view-settings',
    type: 'default',
    data: { label: '⚙️ System Settings' },
    position: { x: 600, y: 150 },
    style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '6px', padding: '10px' }
  }
];

// Initial React Flow Edges
export const initialEdges: Edge[] = [
  {
    id: 'edge-login-dash',
    source: 'view-login',
    target: 'view-dashboard',
    label: 'Successful Sign In',
    style: { stroke: '#38bdf8' },
    labelStyle: { fill: '#f8fafc', fontWeight: 600, fontSize: 10 },
    labelBgStyle: { fill: '#1e293b' }
  },
  {
    id: 'edge-dash-settings',
    source: 'view-dashboard',
    target: 'view-settings',
    label: 'Click Settings Gear',
    style: { stroke: '#94a3b8', strokeDasharray: '5' },
    labelStyle: { fill: '#f8fafc', fontWeight: 600, fontSize: 10 },
    labelBgStyle: { fill: '#1e293b' }
  }
];
