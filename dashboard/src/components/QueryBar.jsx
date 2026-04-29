import { forwardRef } from 'react'
import { Play, Loader } from 'lucide-react'

const RAG_SOURCES = ['IEEE-2025-security-patterns.pdf', 'Alcubierre 1994']

const QueryBar = forwardRef(function QueryBar({ query, setQuery, onRun, isDebating }, ref) {
  return (
    <div className="px-5 py-3 shrink-0">
      <div className="flex items-center gap-2 bg-gmad-panel border border-gmad-border rounded-lg px-3 py-2 focus-within:border-gmad-citation/40 transition-colors">
        <span className="shrink-0 px-2.5 py-1 rounded-md bg-gmad-citation-dim text-gmad-citation text-[11px] font-semibold whitespace-nowrap">
          Intent: Technical
        </span>
        <input ref={ref} type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onRun()}
          placeholder="Enter requirement or question for debate analysis..."
          className="flex-1 bg-transparent text-[14px] text-gmad-text placeholder:text-gmad-muted/50 outline-none min-w-0" />
        <button onClick={onRun} disabled={isDebating || !query.trim()}
          className="shrink-0 flex items-center gap-2 px-4 py-2 bg-gmad-citation text-white text-[13px] font-semibold rounded-lg cursor-pointer whitespace-nowrap hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
          {isDebating ? (<><Loader size={14} className="animate-spin" />Running...</>) : (<><Play size={14} strokeWidth={2} />Run Debate</>)}
        </button>
      </div>
      <div className="flex items-center gap-2 mt-2.5">
        <span className="text-[11px] text-gmad-muted">Sources:</span>
        {RAG_SOURCES.map((src) => (
          <span key={src} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gmad-citation-dim text-gmad-citation text-[11px] font-medium">
            <span className="w-[5px] h-[5px] rounded-full bg-gmad-citation" />{src}
          </span>
        ))}
      </div>
    </div>
  )
})

export default QueryBar
