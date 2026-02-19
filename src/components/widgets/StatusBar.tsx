import { GitBranch, Bell, MessageCircle } from "lucide-react"
import { useRightSidebarStore } from "../../core/services/RightSidebarService"

export const StatusBar = () => {
  const { toggleChat } = useRightSidebarStore();

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
        <div 
          onClick={toggleChat}
          className="flex items-center space-x-1 cursor-pointer hover:bg-white/10 px-1 rounded"
        >
          <MessageCircle size={12} />
          <span>Chat</span>
        </div>
        <span>Ready</span>
        <span>Ln 1, Col 1</span>
        <span>UTF-8</span>
      </div>
    </div>
  )
}
