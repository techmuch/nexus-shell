import{j as l}from"./jsx-runtime-BjG_zV1W.js";import{T as h}from"./TreeWidget-DE8TlC9p.js";import{r as R}from"./index-BWu4c2F4.js";import"./index-DxIfkt58.js";import"./createLucideIcon-Ct5j26lv.js";import"./index-DlVbWVVj.js";import"./bundle-mjs-D19diF5V.js";import"./ContextMenu-BqZrHCx1.js";import"./folder-UZmC4nkZ.js";import"./file-BM7Uy7FP.js";import"./plus-Ca74xhiw.js";import"./trash-2-wHb9ogRm.js";const $={title:"Widgets/General/TreeWidget",component:h,parameters:{layout:"centered"}},b=[{id:"root",label:"Nexus Shell",type:"folder",isOpen:!0,children:[{id:"1",label:"App.tsx",type:"file"},{id:"2",label:"main.tsx",type:"file"},{id:"3",label:"styles",type:"folder",children:[{id:"4",label:"index.css",type:"file"}]}]}],c={render:()=>l.jsx("div",{className:"theme-light w-64 h-96 border bg-background text-foreground",children:l.jsx(h,{data:b})})},m={render:()=>{const[a,s]=R.useState(b),x=(n,r)=>{let t=null;const i=o=>o.filter(e=>e.id===n?(t=e,!1):(e.children&&(e.children=i(e.children)),!0)),d=o=>o.map(e=>e.id===r&&t?{...e,isOpen:!0,children:[...e.children||[],t]}:e.children?{...e,children:d(e.children)}:e),u=i([...a]);t&&s(d(u))},p=(n,r)=>{const t=window.prompt(`Enter ${r} name:`);if(!t)return;const i={id:Math.random().toString(36).substr(2,9),label:t,type:r,isOpen:r==="folder",children:r==="folder"?[]:void 0},d=u=>u.map(o=>o.id===n?{...o,isOpen:!0,children:[...o.children||[],i]}:o.children?{...o,children:d(o.children)}:o);s(d([...a]))},T=n=>{const r=window.prompt("Enter new name:");if(!r)return;const t=i=>i.map(d=>d.id===n?{...d,label:r}:d.children?{...d,children:t(d.children)}:d);s(t([...a]))},D=n=>{if(!window.confirm("Are you sure you want to delete this item?"))return;const r=t=>t.filter(i=>i.id===n?!1:(i.children&&(i.children=r(i.children)),!0));s(r([...a]))};return l.jsxs("div",{className:"theme-light w-80 h-96 border bg-background text-foreground shadow-lg rounded-lg overflow-hidden",children:[l.jsx("div",{className:"p-2 bg-muted border-b text-[10px] font-bold uppercase tracking-widest text-muted-foreground",children:"Interactive Explorer"}),l.jsx(h,{data:a,onMoveNode:x,onNewFile:n=>p(n,"file"),onNewFolder:n=>p(n,"folder"),onRename:T,onDelete:D})]})}};var f,g,N;c.parameters={...c.parameters,docs:{...(f=c.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <div className="theme-light w-64 h-96 border bg-background text-foreground">
      <TreeWidget data={sampleData} />
    </div>
}`,...(N=(g=c.parameters)==null?void 0:g.docs)==null?void 0:N.source}}};var w,v,I;m.parameters={...m.parameters,docs:{...(w=m.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => {
    const [treeData, setTreeData] = useState<ITreeNode[]>(sampleData);
    const handleMoveNode = (draggedId: string, targetId: string) => {
      let draggedNode: ITreeNode | null = null;
      const removeNode = (items: ITreeNode[]): ITreeNode[] => {
        return items.filter(item => {
          if (item.id === draggedId) {
            draggedNode = item;
            return false;
          }
          if (item.children) {
            item.children = removeNode(item.children);
          }
          return true;
        });
      };
      const addNode = (items: ITreeNode[]): ITreeNode[] => {
        return items.map(item => {
          if (item.id === targetId && draggedNode) {
            return {
              ...item,
              isOpen: true,
              children: [...(item.children || []), draggedNode]
            };
          }
          if (item.children) {
            return {
              ...item,
              children: addNode(item.children)
            };
          }
          return item;
        });
      };
      const cleaned = removeNode([...treeData]);
      if (draggedNode) {
        setTreeData(addNode(cleaned));
      }
    };
    const handleNewItem = (parentId: string, type: 'file' | 'folder') => {
      const name = window.prompt(\`Enter \${type} name:\`);
      if (!name) return;
      const newItem: ITreeNode = {
        id: Math.random().toString(36).substr(2, 9),
        label: name,
        type,
        isOpen: type === 'folder',
        children: type === 'folder' ? [] : undefined
      };
      const addRecursive = (items: ITreeNode[]): ITreeNode[] => {
        return items.map(item => {
          if (item.id === parentId) {
            return {
              ...item,
              isOpen: true,
              children: [...(item.children || []), newItem]
            };
          }
          if (item.children) {
            return {
              ...item,
              children: addRecursive(item.children)
            };
          }
          return item;
        });
      };
      setTreeData(addRecursive([...treeData]));
    };
    const handleRename = (nodeId: string) => {
      const newName = window.prompt('Enter new name:');
      if (!newName) return;
      const renameRecursive = (items: ITreeNode[]): ITreeNode[] => {
        return items.map(item => {
          if (item.id === nodeId) {
            return {
              ...item,
              label: newName
            };
          }
          if (item.children) {
            return {
              ...item,
              children: renameRecursive(item.children)
            };
          }
          return item;
        });
      };
      setTreeData(renameRecursive([...treeData]));
    };
    const handleDelete = (nodeId: string) => {
      if (!window.confirm('Are you sure you want to delete this item?')) return;
      const deleteRecursive = (items: ITreeNode[]): ITreeNode[] => {
        return items.filter(item => {
          if (item.id === nodeId) return false;
          if (item.children) {
            item.children = deleteRecursive(item.children);
          }
          return true;
        });
      };
      setTreeData(deleteRecursive([...treeData]));
    };
    return <div className="theme-light w-80 h-96 border bg-background text-foreground shadow-lg rounded-lg overflow-hidden">
        <div className="p-2 bg-muted border-b text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Interactive Explorer
        </div>
        <TreeWidget data={treeData} onMoveNode={handleMoveNode} onNewFile={id => handleNewItem(id, 'file')} onNewFolder={id => handleNewItem(id, 'folder')} onRename={handleRename} onDelete={handleDelete} />
      </div>;
  }
}`,...(I=(v=m.parameters)==null?void 0:v.docs)==null?void 0:I.source}}};const G=["Light","Interactive"];export{m as Interactive,c as Light,G as __namedExportsOrder,$ as default};
