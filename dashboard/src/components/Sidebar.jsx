import { Brain, Database, MessageSquare, Activity, Plus } from 'lucide-react'

const navItems = [
  { icon: Brain, label: 'Debate Workspace', active: true },
  { icon: Database, label: 'Knowledge Base' },
  { icon: MessageSquare, label: 'Debate History' },
  { icon: Activity, label: 'Diagnostics' },
]

export default function Sidebar({ onNewDebate, isDebating }) {
  return (
    <aside className="h-full flex flex-col bg-gmad-bg border-r border-gmad-border">
      {/* Logo */}
      <div className="px-5 pt-5 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-[10px] h-[10px] rounded-full bg-gmad-citation shrink-0" />
          <span className="text-[16px] font-bold text-gmad-text tracking-tight">G-MAD</span>
        </div>
        <p className="text-[11px] text-gmad-muted mt-1 ml-[22px]">Debate Engine</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5">
        {navItems.map(({ icon: Icon, label, active }) => (
          <a
            key={label}
            href="#"
            className={`flex items-center gap-3 px-3 py-2.5 text-[13px] rounded-lg transition-all duration-150
              ${active
                ? 'border-l-2 border-gmad-citation text-gmad-citation bg-gmad-citation-dim font-medium'
                : 'border-l-2 border-transparent text-gmad-muted hover:text-gmad-text hover:bg-gmad-card'
              }`}
          >
            <Icon size={16} strokeWidth={1.8} />
            {label}
          </a>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5">
        <button
          onClick={onNewDebate}
          disabled={isDebating}
          className="w-full py-2.5 bg-gmad-citation text-white text-[13px] font-semibold rounded-lg
                     flex items-center justify-center gap-2 cursor-pointer
                     hover:opacity-90 transition-opacity
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={14} strokeWidth={2.5} />
          New Debate
        </button>
      </div>
    </aside>
  )
}
