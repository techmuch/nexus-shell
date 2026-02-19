import { useStatusBarStore, IStatusBarWidget } from "../../core/services/StatusBarService"
import { commandRegistry } from "../../core/registry/CommandRegistry"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const StatusBar = () => {
  const { widgets } = useStatusBarStore();

  const leftWidgets = widgets.filter(w => w.alignment === 'left');
  const centerWidgets = widgets.filter(w => w.alignment === 'center');
  const rightWidgets = widgets.filter(w => w.alignment === 'right');

  const renderWidget = (widget: IStatusBarWidget) => {
    const Icon = widget.icon;
    const isInteractive = !!(widget.commandId || widget.onClick);

    const handleClick = () => {
      if (widget.onClick) {
        widget.onClick();
      } else if (widget.commandId) {
        commandRegistry.executeCommand(widget.commandId);
      }
    };

    return (
      <div
        key={widget.id}
        onClick={isInteractive ? handleClick : undefined}
        className={cn(
          "flex items-center space-x-1.5 px-2 py-0.5 rounded transition-colors h-full",
          isInteractive ? "cursor-pointer hover:bg-white/10" : "cursor-default",
          widget.className
        )}
      >
        {Icon && <Icon size={12} />}
        {widget.label && <span>{widget.label}</span>}
      </div>
    );
  };

  return (
    <div className="h-6 bg-primary text-primary-foreground text-[11px] flex items-center justify-between px-1 select-none shrink-0 border-t border-white/5">
      <div className="flex items-center space-x-1 h-full">
        {leftWidgets.map(renderWidget)}
      </div>
      <div className="flex items-center space-x-1 h-full">
        {centerWidgets.map(renderWidget)}
      </div>
      <div className="flex items-center space-x-1 h-full">
        {rightWidgets.map(renderWidget)}
      </div>
    </div>
  )
}

