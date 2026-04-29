import { useState } from 'react'
import { Play, Loader, ChevronDown, ChevronRight } from 'lucide-react'
import SystemTelemetry from './SystemTelemetry'

/* ── Collapsible Drawer ── */
function Drawer({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 py-2 text-[11px] font-semibold uppercase tracking-[0.06em]
                   text-text-muted hover:text-text transition-colors cursor-pointer select-none"
      >
        {open
          ? <ChevronDown size={12} strokeWidth={2.5} />
          : <ChevronRight size={12} strokeWidth={2.5} />
        }
        {title}
      </button>
      <div className={`drawer-content ${open ? 'expanded' : 'collapsed'}`}>
        {children}
      </div>
    </div>
  )
}

/* ── Config Row ── */
function ConfigRow({ label, value }) {
  const isCode = /^[a-z0-9_]+/i.test(value) && (
    value.includes('_') || value.includes('(') || /^[a-z]/.test(value)
  )

  return (
    <div className="py-2 border-b border-border-subtle last:border-b-0">
      <div className="text-[11px] text-text-dim mb-0.5">{label}</div>
      <div className={`text-[13px] font-semibold text-text ${isCode ? 'font-mono' : ''}`}>
        {value}
      </div>
    </div>
  )
}

export default function TranscriptInput({ query, setQuery, config, onRun, isDebating, metrics }) {
  return (
    <div className="relative flex flex-col h-full border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface shrink-0">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
          Query Input
        </span>
        <span className="font-mono text-[10px] text-text-dim">
          intent: {config.intent}
        </span>
      </div>

      {/* Status bar — readable telemetry chips + right-anchored Run button */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-raised shrink-0 gap-3">
        <SystemTelemetry />
        <button
          onClick={onRun}
          disabled={isDebating || !query.trim()}
          className="px-4 py-2 bg-accent-blue text-white text-[12px] font-semibold cursor-pointer rounded-md
                     flex items-center gap-2 whitespace-nowrap shrink-0
                     hover:opacity-90 transition-all
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isDebating ? (
            <>
              <Loader size={13} className="animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play size={13} strokeWidth={2} />
              Run debate
            </>
          )}
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ─── SETUP DRAWER ─── */}
        <Drawer title="Setup" defaultOpen={true}>
          <div className="space-y-4 pb-2">
            {/* Requirement textarea */}
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-text-dim mb-2">
                Requirement under analysis
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={5}
                placeholder="Enter the software requirement to debate..."
                className="w-full p-3 bg-bg border border-border rounded-md text-[13px] leading-[1.6]
                           text-text placeholder:text-text-dim/50 resize-none
                           focus:outline-none focus:border-accent-blue/40 transition-colors"
              />
            </div>

            {/* Config table — stacked label/value */}
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-text-dim mb-1">
                Debate configuration
              </div>
              <div className="bg-bg border border-border rounded-md px-3">
                {Object.entries(config).map(([key, val]) => (
                  <ConfigRow key={key} label={key} value={val} />
                ))}
              </div>
            </div>
          </div>
        </Drawer>

        {/* ─── OUTPUT DRAWER ─── */}
        {metrics && (
          <Drawer title="Output" defaultOpen={true}>
            <div className="space-y-3 pb-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                Proof of logic
              </div>
              <div className="p-3 bg-bg border border-border rounded-md space-y-2">
                {/* Consensus — green */}
                <div className="flex items-center gap-2">
                  <span className="w-[6px] h-[6px] rounded-full bg-semantic-success shrink-0" />
                  <span className="font-mono text-[12px] text-semantic-success leading-[1.5]">
                    Consensus reached in {metrics.iterations} iterations
                  </span>
                </div>
                {/* Resolved — green */}
                <div className="flex items-center gap-2">
                  <span className="w-[6px] h-[6px] rounded-full bg-semantic-success shrink-0" />
                  <span className="font-mono text-[12px] text-semantic-success leading-[1.5]">
                    {metrics.contradictions} security contradictions resolved
                  </span>
                </div>
                {/* Open items — amber */}
                <div className="flex items-center gap-2">
                  <span className="w-[6px] h-[6px] rounded-full bg-semantic-warning shrink-0" />
                  <span className="font-mono text-[12px] text-semantic-warning leading-[1.5]">
                    {metrics.openItems} unresolved edge case flagged
                  </span>
                </div>
              </div>
            </div>
          </Drawer>
        )}
      </div>
    </div>
  )
}
