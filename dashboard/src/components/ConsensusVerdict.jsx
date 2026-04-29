import { motion } from 'framer-motion'
import { Scale, FileText } from 'lucide-react'

/**
 * Strip any @startuml...@enduml blocks from the verdict text.
 * Handles cases where the backend embeds UML code in the same string.
 */
function stripPlantUml(text) {
  return text.replace(/@startuml[\s\S]*?@enduml/g, '').trim()
}

/* ── Render verdict text with inline citation chips ── */
function renderVerdictWithCitations(text) {
  const cleaned = stripPlantUml(text)
  const parts = cleaned.split(/(\[grounding:\s*.+?\])/)
  return parts.map((part, i) => {
    const match = part.match(/\[grounding:\s*(.+?)\]/)
    if (match) {
      return (
        <span
          key={i}
          className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-full
                     bg-gmad-citation-dim text-gmad-citation text-[11px] font-mono font-medium align-middle
                     cursor-pointer hover:bg-gmad-citation/20 transition-colors"
        >
          <FileText size={10} strokeWidth={2} />
          {match[1]}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export default function ConsensusVerdict({ verdict, stats, isVisible }) {
  if (!isVisible) return null

  /* Extract cited sources from verdict text (after stripping UML) */
  const cleanedVerdict = stripPlantUml(verdict)
  const citedSources = []
  const sourceRegex = /\[grounding:\s*(.+?)\]/g
  let m
  while ((m = sourceRegex.exec(cleanedVerdict)) !== null) {
    citedSources.push(m[1])
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="mx-5 mb-3 rounded-lg bg-gmad-card border border-gmad-border overflow-hidden shrink-0"
    >
      {/* Violet left accent */}
      <div className="flex">
        <div className="w-1 bg-gmad-citation shrink-0 rounded-l-lg" />

        <div className="flex-1 p-5">
          {/* Header — static, no tabs */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Scale size={16} strokeWidth={1.8} className="text-gmad-citation" />
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-gmad-text">
                Consensus Verdict
              </span>
            </div>
            <span className="text-[11px] text-gmad-muted">
              Synthesised from 2 agents · {stats.Rounds} rounds · 2 RAG sources
            </span>
          </div>

          {/* Verdict body — text only, UML silently stripped */}
          <div className="text-[14px] leading-[1.7] text-gmad-text max-w-[90ch]">
            {renderVerdictWithCitations(verdict)}
          </div>

          {/* Footer — cited source pills */}
          {citedSources.length > 0 && (
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gmad-border">
              <span className="text-[11px] text-gmad-muted">Cited sources:</span>
              {citedSources.map((src, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                             bg-gmad-citation-dim text-gmad-citation text-[11px] font-mono font-medium
                             cursor-pointer hover:bg-gmad-citation/20 transition-colors"
                >
                  <FileText size={10} strokeWidth={2} />
                  {src}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
