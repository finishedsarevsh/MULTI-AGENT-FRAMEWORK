import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gavel, Copy, Check, Image } from 'lucide-react'

export default function ConsensusJudge({ verdict, stats, isVisible }) {
  const [showUml, setShowUml] = useState(false)
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="border-t border-border bg-surface px-5 py-4 space-y-3 shrink-0"
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gavel size={14} strokeWidth={1.8} className="text-accent-blue" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
            Consensus Judge
          </span>
        </div>

        <div className="flex items-center gap-5">
          {/* Stats */}
          {Object.entries(stats).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] uppercase text-text-dim">{key}</span>
              <span className="font-mono text-[12px] text-text">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content area: text or UML placeholder */}
      <AnimatePresence mode="wait">
        {showUml ? (
          <motion.div
            key="uml"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-[120px] bg-bg border border-border flex items-center justify-center"
          >
            <div className="text-center text-text-dim">
              <Image size={24} strokeWidth={1.2} className="mx-auto mb-2 opacity-40" />
              <p className="text-[11px] font-mono">PlantUML SVG will render here</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-[13px] leading-[1.6] text-text"
          >
            {verdict}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-text-dim">
          Synthesized from 2 agents, {stats.Rounds} debate rounds, and 2 RAG-grounded sources.
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUml(!showUml)}
            className={`px-3 py-1.5 text-[11px] font-medium border cursor-pointer transition-colors
              ${showUml
                ? 'border-accent-blue text-accent-blue bg-accent-blue-dim'
                : 'border-border text-text-dim hover:text-text-muted hover:border-text-dim'
              }`}
          >
            {showUml ? 'View Verdict' : 'View UML'}
          </button>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-[11px] font-medium border border-border text-text-dim
                       hover:text-text-muted hover:border-text-dim cursor-pointer transition-colors
                       flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check size={11} strokeWidth={2} className="text-accent-emerald" />
                Copied
              </>
            ) : (
              <>
                <Copy size={11} strokeWidth={1.8} />
                Copy Result
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
