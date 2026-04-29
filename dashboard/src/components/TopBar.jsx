import { Settings } from 'lucide-react'

export default function TopBar({ onToggleConfig }) {
  return (
    <header className="flex items-center justify-between px-5 h-12 border-b border-gmad-border bg-gmad-panel shrink-0">
      <div className="flex items-center gap-2 text-[13px]">
        <span className="text-gmad-muted">Workspace</span>
        <span className="text-gmad-muted/50">/</span>
        <span className="text-gmad-text font-medium">Active Debate</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-[7px] h-[7px] rounded-full bg-gmad-success animate-pulse" />
          <span className="text-[12px] text-gmad-muted">Ollama connected</span>
        </div>
        <button
          onClick={onToggleConfig}
          className="p-2 text-gmad-muted hover:text-gmad-text hover:bg-gmad-card rounded-lg
                     cursor-pointer transition-colors"
          title="Toggle configuration panel"
        >
          <Settings size={16} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  )
}
