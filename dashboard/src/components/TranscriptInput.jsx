import { Play, Loader } from 'lucide-react'
import SystemTelemetry from './SystemTelemetry'

export default function TranscriptInput({ query, setQuery, config, onRun, isDebating, metrics }) {
  return (
    <div className="relative flex flex-col h-full border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface shrink-0">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
          Query Input
        </span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-text-dim">
            intent: {config.intent}
          </span>
          <SystemTelemetry />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
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
            className="w-full p-3 bg-bg border border-border text-[13px] leading-[1.6]
                       text-text placeholder:text-text-dim/50 resize-none
                       focus:outline-none focus:border-accent-blue/40 transition-colors"
          />
        </div>

        {/* Config table */}
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-text-dim mb-2">
            Debate configuration
          </div>
          {Object.entries(config).map(([key, val]) => (
            <div key={key} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
              <span className="text-[12px] text-text-dim">{key}</span>
              <span className="font-mono text-[12px] text-text">{val}</span>
            </div>
          ))}
        </div>

        {/* Run button */}
        <button
          onClick={onRun}
          disabled={isDebating || !query.trim()}
          className="w-full py-2.5 bg-accent-blue text-white text-[13px] font-medium cursor-pointer
                     flex items-center justify-center gap-2
                     hover:opacity-85 transition-opacity
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isDebating ? (
            <>
              <Loader size={14} className="animate-spin" />
              Running debate...
            </>
          ) : (
            <>
              <Play size={14} strokeWidth={2} />
              Run debate
            </>
          )}
        </button>

        {/* Proof of Logic — only shown after debate */}
        {metrics && (
          <div className="border-t border-border pt-4 space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
              Proof of logic
            </div>
            <div className="p-3 bg-bg border border-border">
              <div className="font-mono text-[12px] text-text leading-[1.5]">
                Consensus reached in {metrics.iterations} iterations.<br />
                {metrics.contradictions} security contradictions resolved.<br />
                {metrics.openItems} unresolved edge case flagged.
              </div>
            </div>

            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted mt-3">
              PlantUML output (live preview)
            </div>
            <pre className="p-3 bg-bg border border-border font-mono text-[11px] leading-[1.5] text-text-dim overflow-x-auto whitespace-pre">
{metrics.plantuml}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
