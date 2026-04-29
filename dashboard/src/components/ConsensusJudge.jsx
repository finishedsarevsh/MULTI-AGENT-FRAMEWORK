import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scale, Copy, Check, Download, FileText } from 'lucide-react'

/* ── Stat Card with descriptive label + semantic color ── */
function StatCard({ label, value, color }) {
  const colorMap = {
    info:    'text-semantic-info    border-semantic-info/20    bg-semantic-info-dim',
    danger:  'text-semantic-danger  border-semantic-danger/20  bg-semantic-danger-dim',
    success: 'text-semantic-success border-semantic-success/20 bg-semantic-success-dim',
    warning: 'text-semantic-warning border-semantic-warning/20 bg-semantic-warning-dim',
  }
  const cls = colorMap[color] || colorMap.info

  return (
    <div className={`flex-1 px-4 py-3 rounded-lg border ${cls}`}>
      <div className="text-[22px] font-bold font-mono tabular-nums leading-none mb-1">
        {value}
      </div>
      <div className="text-[11px] tracking-[0.04em] font-medium opacity-80 leading-tight">
        {label}
      </div>
    </div>
  )
}

/* ── Citation Chip (inline in verdict text) ── */
function renderVerdictWithCitations(text) {
  const parts = text.split(/(\[grounding:\s*.+?\])/)
  return parts.map((part, i) => {
    const match = part.match(/\[grounding:\s*(.+?)\]/)
    if (match) {
      return (
        <span
          key={i}
          className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-full
                     bg-semantic-info-dim border border-semantic-info/20
                     text-semantic-info text-[11px] font-medium align-middle
                     cursor-pointer hover:bg-semantic-info/15 transition-colors"
        >
          <FileText size={10} strokeWidth={2} />
          {match[1]}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })
}

/* ── Tab Button ── */
function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 text-[11px] font-semibold rounded-full cursor-pointer transition-all
        ${active
          ? 'bg-verdict-accent/15 text-verdict-accent border border-verdict-accent/30'
          : 'text-text-dim hover:text-text-muted border border-transparent hover:border-border'
        }`}
    >
      {children}
    </button>
  )
}

export default function ConsensusJudge({ verdict, stats, isVisible, plantuml }) {
  const [activeTab, setActiveTab] = useState('verdict')
  const [copied, setCopied] = useState(false)

  if (!isVisible) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(verdict)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = verdict
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="shrink-0"
    >
      {/* ── Stat Bar — full descriptive labels with semantic colors ── */}
      <div className="px-5 pt-4 pb-3 border-b border-consensus-border bg-consensus-bg">
        <div className="flex gap-3">
          <StatCard label="Debate rounds completed" value={stats.Rounds} color="info" />
          <StatCard label="Contradictions found" value={stats['Contradictions found']} color="danger" />
          <StatCard label="Contradictions resolved" value={stats['Contradictions resolved']} color="success" />
          <StatCard label="Open items remaining" value={stats['Open items']} color="warning" />
        </div>
      </div>

      {/* ── Verdict Banner — distinct purple background ── */}
      <div className="border-b border-verdict-border bg-verdict-bg">
        {/* Banner header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <Scale size={16} strokeWidth={1.8} className="text-verdict-accent" />
            <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-verdict-accent">
              Consensus Verdict
            </span>
            <div className="flex items-center gap-1 ml-2">
              <TabButton active={activeTab === 'verdict'} onClick={() => setActiveTab('verdict')}>
                Verdict
              </TabButton>
              <TabButton active={activeTab === 'uml'} onClick={() => setActiveTab('uml')}>
                UML Diagram
              </TabButton>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-[12px] font-medium border border-verdict-border rounded-md
                         text-verdict-accent/70 hover:text-verdict-accent hover:border-verdict-accent/40
                         cursor-pointer transition-colors flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check size={12} strokeWidth={2} className="text-semantic-success" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={12} strokeWidth={1.8} />
                  Copy
                </>
              )}
            </button>
            <button
              className="px-3 py-1.5 text-[12px] font-medium border border-verdict-border rounded-md
                         text-verdict-accent/70 hover:text-verdict-accent hover:border-verdict-accent/40
                         cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Download size={12} strokeWidth={1.8} />
              Download
            </button>
          </div>
        </div>

        {/* Banner content */}
        <div className="px-5 pb-4">
          <AnimatePresence mode="wait">
            {activeTab === 'uml' ? (
              <motion.div
                key="uml"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <pre className="p-4 bg-bg border border-border rounded-lg font-mono text-[11px]
                               leading-[1.5] text-text-dim overflow-x-auto whitespace-pre">
{plantuml || '// No PlantUML output yet'}
                </pre>
              </motion.div>
            ) : (
              <motion.div
                key="text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-[14px] leading-[1.75] text-text max-w-[90ch]"
              >
                {renderVerdictWithCitations(verdict)}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer note */}
          <div className="mt-3 pt-2 border-t border-verdict-border/50">
            <span className="text-[11px] text-text-dim">
              Synthesized from 2 agents, {stats.Rounds} debate rounds, and 2 RAG-grounded sources.
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
