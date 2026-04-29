import { useState, useEffect, memo } from 'react'
import { ChevronLeft, ChevronRight, Cpu, Zap, Activity, Database, FileText, ChevronDown } from 'lucide-react'

function jitter(base, range) {
  return base + Math.floor(Math.random() * range * 2) - range
}

function MiniStat({ icon: Icon, label, value, iconColor }) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gmad-bg border border-gmad-border">
      <Icon size={12} strokeWidth={2} className={iconColor} />
      <span className="text-[10px] text-gmad-muted font-medium uppercase">{label}</span>
      <span className="text-[11px] text-gmad-text font-mono font-semibold tabular-nums">{value}</span>
    </div>
  )
}

function SourceItem({ filename, relevance }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gmad-border last:border-b-0">
      <div className="flex items-center gap-2">
        <FileText size={12} strokeWidth={1.8} className="text-gmad-citation shrink-0" />
        <span className="text-[12px] text-gmad-text font-mono">{filename}</span>
      </div>
      <span className="text-[10px] text-gmad-muted font-mono">{relevance}</span>
    </div>
  )
}

const ConfigPanel = memo(function ConfigPanel({ isOpen, onToggle, query, setQuery, config, onConfigChange, metrics }) {
  const [tokens, setTokens] = useState(1024)
  const [latency, setLatency] = useState(42)

  useEffect(() => {
    const id = setInterval(() => {
      setTokens(prev => Math.min(8000, Math.max(900, jitter(prev, 64))))
      setLatency(jitter(43, 5))
    }, 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className={`config-panel shrink-0 h-full border-l border-gmad-border bg-gmad-panel flex flex-col overflow-hidden ${isOpen ? 'w-[320px]' : 'w-[48px]'}`}>
      <button onClick={onToggle} className="flex items-center justify-center h-12 border-b border-gmad-border text-gmad-muted hover:text-gmad-text cursor-pointer transition-colors shrink-0">
        {isOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {!isOpen && (
        <div className="flex flex-col items-center gap-4 py-4">
          <Database size={16} className="text-gmad-muted" />
          <Cpu size={16} className="text-gmad-muted" />
          <Activity size={16} className="text-gmad-muted" />
        </div>
      )}

      {isOpen && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-gmad-muted mb-3">Setup</div>
            <label className="block text-[11px] font-medium text-gmad-muted mb-1.5">Requirement Under Analysis</label>
            <textarea value={query} onChange={(e) => setQuery(e.target.value)} rows={4} placeholder="Enter the software requirement..."
              className="w-full p-3 bg-gmad-bg border border-gmad-border rounded-lg text-[13px] leading-[1.5] text-gmad-text placeholder:text-gmad-muted/50 resize-none focus:outline-none focus:border-gmad-citation/40 transition-colors" />
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <MiniStat icon={Cpu} label="VRAM" value="4.2 / 12 GB" iconColor="text-gmad-agent1" />
              <MiniStat icon={Zap} label="Tokens" value={`${tokens.toLocaleString()} / 8k`} iconColor="text-gmad-success" />
              <MiniStat icon={Activity} label="Latency" value={`${latency}ms`} iconColor="text-gmad-warning" />
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-gmad-muted mb-3">Debate Configuration</div>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-gmad-muted mb-1">Agent 1 Role</label>
                <input type="text" value={config.agent1Role} onChange={(e) => onConfigChange('agent1Role', e.target.value)} placeholder="Business Analyst"
                  className="w-full px-3 py-2 bg-gmad-bg border border-gmad-border rounded-lg text-[13px] text-gmad-text placeholder:text-gmad-muted/50 focus:outline-none focus:border-gmad-citation/40 transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] text-gmad-muted mb-1">Agent 2 Role</label>
                <input type="text" value={config.agent2Role} onChange={(e) => onConfigChange('agent2Role', e.target.value)} placeholder="Software Architect"
                  className="w-full px-3 py-2 bg-gmad-bg border border-gmad-border rounded-lg text-[13px] text-gmad-text placeholder:text-gmad-muted/50 focus:outline-none focus:border-gmad-citation/40 transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] text-gmad-muted mb-1">Model</label>
                <select value={config.model} onChange={(e) => onConfigChange('model', e.target.value)}
                  className="w-full px-3 py-2 bg-gmad-bg border border-gmad-border rounded-lg text-[13px] text-gmad-text focus:outline-none focus:border-gmad-citation/40 transition-colors cursor-pointer appearance-none">
                  <option value="llama3">llama3</option>
                  <option value="mistral">mistral</option>
                  <option value="gemma2">gemma2</option>
                  <option value="phi3">phi3</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-gmad-muted mb-1">RAG Source</label>
                <div className="px-3 py-2 bg-gmad-bg border border-gmad-border rounded-lg">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gmad-citation-dim text-gmad-citation text-[11px] font-medium">
                    <Database size={10} />chroma_db (2 docs)
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-gmad-muted mb-1">Max Rounds</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => onConfigChange('maxRounds', Math.max(1, config.maxRounds - 1))}
                    className="w-8 h-8 flex items-center justify-center bg-gmad-bg border border-gmad-border rounded-lg text-gmad-muted hover:text-gmad-text hover:border-gmad-citation/40 cursor-pointer transition-colors">−</button>
                  <span className="w-8 text-center text-[14px] font-mono font-semibold text-gmad-text">{config.maxRounds}</span>
                  <button onClick={() => onConfigChange('maxRounds', Math.min(5, config.maxRounds + 1))}
                    className="w-8 h-8 flex items-center justify-center bg-gmad-bg border border-gmad-border rounded-lg text-gmad-muted hover:text-gmad-text hover:border-gmad-citation/40 cursor-pointer transition-colors">+</button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-gmad-muted mb-1">Intent</label>
                <select value={config.intent} onChange={(e) => onConfigChange('intent', e.target.value)}
                  className="w-full px-3 py-2 bg-gmad-bg border border-gmad-border rounded-lg text-[13px] text-gmad-text focus:outline-none focus:border-gmad-citation/40 transition-colors cursor-pointer appearance-none">
                  <option value="technical">Technical</option>
                  <option value="legal">Legal</option>
                  <option value="medical">Medical</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>
          </div>

          {metrics && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-gmad-muted mb-3">Source Reasoning Trail</div>
              <div className="bg-gmad-bg border border-gmad-border rounded-lg px-3">
                <SourceItem filename="IEEE-2025-security-patterns.pdf" relevance="Relevance: 94%" />
                <SourceItem filename="HIPAA-compliance-checklist.md" relevance="Relevance: 87%" />
              </div>
              <div className="mt-3 p-3 bg-gmad-bg border border-gmad-border rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-[6px] h-[6px] rounded-full bg-gmad-success shrink-0" />
                  <span className="font-mono text-[11px] text-gmad-success">Consensus reached in {metrics.iterations} iterations</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[6px] h-[6px] rounded-full bg-gmad-success shrink-0" />
                  <span className="font-mono text-[11px] text-gmad-success">{metrics.contradictions} contradictions resolved</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[6px] h-[6px] rounded-full bg-gmad-warning shrink-0" />
                  <span className="font-mono text-[11px] text-gmad-warning">{metrics.openItems} unresolved item flagged</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

export default ConfigPanel
