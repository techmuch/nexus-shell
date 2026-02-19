export const MenuBar = () => {
  return (
    <div className="h-8 bg-muted border-b flex items-center px-4 select-none">
      <div className="font-semibold mr-6">Nexus Shell</div>
      <div className="flex space-x-4 text-sm">
        <div className="cursor-pointer hover:bg-accent hover:text-accent-foreground px-2 py-0.5 rounded">File</div>
        <div className="cursor-pointer hover:bg-accent hover:text-accent-foreground px-2 py-0.5 rounded">Edit</div>
        <div className="cursor-pointer hover:bg-accent hover:text-accent-foreground px-2 py-0.5 rounded">View</div>
        <div className="cursor-pointer hover:bg-accent hover:text-accent-foreground px-2 py-0.5 rounded">Help</div>
      </div>
    </div>
  )
}
