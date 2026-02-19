import { Files, Search, Settings, GitGraph, Plug } from "lucide-react"

export const ActivityBar = () => {
  return (
    <div className="w-12 h-full bg-muted border-r flex flex-col items-center py-2 select-none">
      <div className="flex-1 flex flex-col space-y-4">
        <div className="p-2 cursor-pointer hover:bg-accent rounded text-muted-foreground hover:text-foreground">
          <Files size={24} />
        </div>
        <div className="p-2 cursor-pointer hover:bg-accent rounded text-muted-foreground hover:text-foreground">
          <Search size={24} />
        </div>
        <div className="p-2 cursor-pointer hover:bg-accent rounded text-muted-foreground hover:text-foreground">
          <GitGraph size={24} />
        </div>
        <div className="p-2 cursor-pointer hover:bg-accent rounded text-muted-foreground hover:text-foreground">
          <Plug size={24} />
        </div>
      </div>
      <div className="p-2 cursor-pointer hover:bg-accent rounded text-muted-foreground hover:text-foreground">
        <Settings size={24} />
      </div>
    </div>
  )
}
