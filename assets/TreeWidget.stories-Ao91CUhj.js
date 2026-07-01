import{j as i}from"./jsx-runtime-BjG_zV1W.js";import{T as u}from"./TreeWidget-BAjp4Q8l.js";import{r as D}from"./index-BWu4c2F4.js";import"./index-DxIfkt58.js";import"./createLucideIcon-Ct5j26lv.js";import"./index-DlVbWVVj.js";import"./bundle-mjs-D19diF5V.js";import"./ContextMenu-Cvj1ARww.js";import"./plus-Ca74xhiw.js";import"./map-DgzPSx_z.js";import"./trash-2-wHb9ogRm.js";import"./folder-UZmC4nkZ.js";import"./file-BM7Uy7FP.js";const G={title:"Widgets/General/TreeWidget",component:u,parameters:{layout:"centered"}},v=[{id:"root",label:"Nexus Shell",type:"folder",isOpen:!0,children:[{id:"1",label:"App.tsx",type:"file"},{id:"2",label:"main.tsx",type:"file"},{id:"3",label:"styles",type:"folder",children:[{id:"4",label:"index.css",type:"file"}]}]}],l={render:()=>i.jsx("div",{className:"theme-light w-64 h-96 border bg-background text-foreground",children:i.jsx(u,{data:v})})},s={render:()=>{const[a,c]=D.useState(v),b=(r,o)=>{let t=null;const n=m=>m.filter(e=>e.id===r?(t=e,!1):(e.children&&(e.children=n(e.children)),!0)),d=m=>m.map(e=>e.id===o&&t?{...e,isOpen:!0,children:[...e.children||[],t]}:e.children?{...e,children:d(e.children)}:e),T=n([...a]);t&&c(d(T))},x=r=>{const o=window.prompt("Enter new name:");if(!o)return;const t=n=>n.map(d=>d.id===r?{...d,label:o}:d.children?{...d,children:t(d.children)}:d);c(t([...a]))},I=r=>{if(!window.confirm("Are you sure you want to delete this item?"))return;const o=t=>t.filter(n=>n.id===r?!1:(n.children&&(n.children=o(n.children)),!0));c(o([...a]))};return i.jsxs("div",{className:"theme-light w-80 h-96 border bg-background text-foreground shadow-lg rounded-lg overflow-hidden",children:[i.jsx("div",{className:"p-2 bg-muted border-b text-[10px] font-bold uppercase tracking-widest text-muted-foreground",children:"Interactive Explorer"}),i.jsx(u,{data:a,onMoveNode:b,onNewFile:r=>console.log("New file in:",r),onNewFolder:r=>console.log("New folder in:",r),onRename:x,onDelete:I})]})}};var g,h,p;l.parameters={...l.parameters,docs:{...(g=l.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <div className="theme-light w-64 h-96 border bg-background text-foreground">
      <TreeWidget data={sampleData} />
    </div>
}`,...(p=(h=l.parameters)==null?void 0:h.docs)==null?void 0:p.source}}};var f,N,w;s.parameters={...s.parameters,docs:{...(f=s.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
        <TreeWidget data={treeData} onMoveNode={handleMoveNode} onNewFile={(parentId: string | null) => console.log('New file in:', parentId)} onNewFolder={(parentId: string | null) => console.log('New folder in:', parentId)} onRename={handleRename} onDelete={handleDelete} />
      </div>;
  }
}`,...(w=(N=s.parameters)==null?void 0:N.docs)==null?void 0:w.source}}};const q=["Light","Interactive"];export{s as Interactive,l as Light,q as __namedExportsOrder,G as default};
