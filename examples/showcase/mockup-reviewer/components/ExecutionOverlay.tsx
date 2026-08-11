import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ExecutionOverlayProps {
  isExecuting: boolean;
  setIsExecuting: (val: boolean) => void;
  executionStep: number;
  setExecutionStep: (step: number | ((prev: number) => number)) => void;
}

export const ExecutionOverlay: React.FC<ExecutionOverlayProps> = ({
  isExecuting,
  setIsExecuting,
  executionStep,
  setExecutionStep,
}) => {
  // Simulated compilation/execution step progression
  useEffect(() => {
    if (!isExecuting) return;
    if (executionStep >= 3) return;

    const timer = setTimeout(() => {
      setExecutionStep((prev) => prev + 1);
    }, 1200);

    return () => clearTimeout(timer);
  }, [isExecuting, executionStep, setExecutionStep]);

  if (!isExecuting) return null;

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-md z-50 flex flex-col justify-center items-center p-6 text-center select-none animate-fade-in">
      <div className="max-w-md w-full bg-card border border-border shadow-2xl rounded-xl p-8 relative overflow-hidden flex flex-col items-center">
        
        {executionStep < 3 ? (
          <>
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
            <h3 className="text-sm font-bold text-foreground mb-1">Executing Plan Components</h3>
            <div className="w-full bg-secondary rounded-full h-1.5 my-3 overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-700" 
                style={{ width: `${(executionStep + 1) * 33}%` }} 
              />
            </div>
            <p className="text-xs text-muted-foreground/80 font-mono italic animate-pulse">
              {executionStep === 0 ? "Compiling view node structures..." :
               executionStep === 1 ? "Registering components in registries..." :
               "Bundling workspace build targets..."}
            </p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center text-emerald-500 mb-4 animate-bounce">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">Execution Complete!</h3>
            <p className="text-xs text-muted-foreground/90 max-w-sm leading-relaxed mb-5">
              The AI Plan has successfully run: view node configurations, parent templates, and annotations are fully compiled.
            </p>
            <button
              onClick={() => setIsExecuting(false)}
              className="py-1.5 px-4 bg-primary text-primary-foreground rounded font-semibold text-xs transition-shadow hover:shadow border border-primary/20"
            >
              Close Overlay
            </button>
          </>
        )}
      </div>
    </div>
  );
};
