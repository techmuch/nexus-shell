import { GitBranch, Bell } from "lucide-react"

export const StatusBar = () => {
  return (
    <div className="h-6 bg-primary text-primary-foreground text-xs flex items-center justify-between px-2 select-none">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1 cursor-pointer hover:bg-white/10 px-1 rounded">
          <GitBranch size={12} />
          <span>main</span>
        </div>
        <div className="flex items-center space-x-1 cursor-pointer hover:bg-white/10 px-1 rounded">
          <Bell size={12} />
          <span>0</span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <span>Ready</span>
        <span>Ln 1, Col 1</span>
        <span>UTF-8</span>
      </div>
    </div>
  )
}
