export default function TopBar() {
  return (
    <header className="flex items-center justify-between px-5 h-12 border-b border-gmad-border bg-gmad-panel shrink-0">
      <div className="flex items-center gap-2 text-[13px]">
        <span className="text-gmad-muted">Workspace</span>
        <span className="text-gmad-muted/50">/</span>
        <span className="text-gmad-text font-medium">Active Debate</span>
      </div>

    </header>
  )
}
