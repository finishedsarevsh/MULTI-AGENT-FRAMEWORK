import { Brain, Database, MessageSquare, Terminal, FileText, HelpCircle, Plus } from 'lucide-react'

const navItems = [
  { icon: Brain, label: 'Debate Workspace', active: true },
  { icon: Database, label: 'Knowledge Base' },
  { icon: MessageSquare, label: 'Debate History' },
  { icon: Terminal, label: 'System Logs' },
]

export default function Sidebar({ onNewDebate, isDebating }) {
  return (
    <aside className="h-full flex flex-col bg-bg border-r border-border">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">
          G-MAD Console
        </h2>
        <p className="text-[11px] text-text-dim font-mono mt-1">
          Session active
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-0.5">
        {navItems.map(({ icon: Icon, label, active }) => (
          <a
            key={label}
            href="#"
            className={`flex items-center gap-3 px-3 py-2.5 text-[13px] rounded-md transition-colors duration-150
              ${active
                ? 'bg-accent-blue-dim text-accent-blue'
                : 'text-text-dim hover:text-text-muted hover:bg-white/[0.03]'
              }`}
          >
            <Icon size={15} strokeWidth={1.8} />
            {label}
          </a>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 space-y-3">
        <button
          onClick={onNewDebate}
          disabled={isDebating}
          className="w-full py-2.5 bg-accent-blue text-white text-[13px] font-medium rounded-md
                     flex items-center justify-center gap-2 cursor-pointer
                     hover:opacity-85 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={14} strokeWidth={2} />
          New Debate
        </button>
        <div className="space-y-2">
          <a href="#" className="flex items-center gap-2 text-[11px] text-text-dim hover:text-text-muted transition-colors">
            <FileText size={12} strokeWidth={1.5} /> Documentation
          </a>
          <a href="#" className="flex items-center gap-2 text-[11px] text-text-dim hover:text-text-muted transition-colors">
            <HelpCircle size={12} strokeWidth={1.5} /> Support
          </a>
        </div>
      </div>
    </aside>
  )
}
