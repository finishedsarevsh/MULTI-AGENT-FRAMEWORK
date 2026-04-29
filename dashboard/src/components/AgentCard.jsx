import { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, FileText } from 'lucide-react'

/* ── Citation Chip ── */
function CitationChip({ text }) {
  // Extract filename from "[grounding: filename.pdf]" pattern
  const match = text.match(/\[grounding:\s*(.+?)\]/)
  if (!match) return <span className="font-mono text-[11px] opacity-70">{text}</span>

  const filename = match[1]
  return (
    <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full
                     bg-semantic-info-dim border border-semantic-info/20
                     text-semantic-info text-[11px] font-medium cursor-pointer
                     hover:bg-semantic-info/15 transition-colors">
      <FileText size={11} strokeWidth={2} />
      {filename}
    </span>
  )
}

/* ── Confidence Bar — labeled with descriptor ── */
function ConfidenceIndicator({ score, color, agentName }) {
  const colorLabel = color === '#3B82F6' ? 'Agent 1' : 'Agent 2'
  const barBg = color === '#3B82F6'
    ? 'bg-accent-blue/15'
    : 'bg-accent-emerald/15'

  return (
    <div className="flex items-center gap-3 min-w-0">
      {/* Label */}
      <span className="text-[11px] text-text-dim whitespace-nowrap">
        Consensus agreement
      </span>
      {/* Bar */}
      <div className={`w-[80px] h-[6px] rounded-full ${barBg} overflow-hidden shrink-0`}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </div>
      {/* Percentage */}
      <span
        className="font-mono text-[12px] font-bold tabular-nums shrink-0"
        style={{ color }}
      >
        {score}%
      </span>
    </div>
  )
}

/* ── Round Pill Badge ── */
function RoundBadge({ label, color }) {
  const bgColor = color === 'blue'
    ? 'bg-accent-blue/10 text-accent-blue border-accent-blue/20'
    : 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20'

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase
                     tracking-[0.06em] border ${bgColor}`}>
      {label}
    </span>
  )
}

/* ── Sticky Round Navigator ── */
function RoundNavigator({ messages, color, onScrollTo }) {
  if (messages.length === 0) return null
  const pillColor = color === 'blue'
    ? 'hover:bg-accent-blue/10 hover:text-accent-blue'
    : 'hover:bg-accent-emerald/10 hover:text-accent-emerald'

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-border-subtle bg-surface-raised shrink-0">
      <span className="text-[10px] text-text-dim mr-1.5 uppercase tracking-wider">Jump to:</span>
      {messages.map((_, i) => (
        <button
          key={i}
          onClick={() => onScrollTo(i)}
          className={`px-2.5 py-0.5 text-[10px] font-semibold font-mono rounded-full
                     text-text-dim cursor-pointer transition-colors ${pillColor}`}
        >
          R{i + 1}
        </button>
      ))}
    </div>
  )
}

export default function AgentCard({
  agentName,
  type,
  confidenceScore,
  messages,
  color,
  isDebating,
  isLast = false,
}) {
  const accentColor = color === 'blue' ? '#3B82F6' : '#10B981'
  const scrollContainerRef = useRef(null)
  const roundRefs = useRef([])

  const handleScrollTo = useCallback((index) => {
    const el = roundRefs.current[index]
    if (el && scrollContainerRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  return (
    <div className={`flex flex-col h-full ${!isLast ? 'border-r border-border' : ''}`}>
      {/* Header — with labeled confidence bar */}
      <div className="px-4 py-3 border-b border-border bg-surface shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-[7px] h-[7px] rounded-full shrink-0"
              style={{ background: accentColor }}
            />
            <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-text-muted">
              {agentName} — {type}
            </span>
            {messages.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-text-dim font-mono ml-1">
                <MessageCircle size={10} strokeWidth={2} />
                {messages.length} rounds
              </span>
            )}
          </div>
          <ConfidenceIndicator score={confidenceScore} color={accentColor} agentName={agentName} />
        </div>
      </div>

      {/* Round Navigator — sticky tabs */}
      <RoundNavigator messages={messages} color={color} onScrollTo={handleScrollTo} />

      {/* Messages — with padding and line-length cap */}
      <div className="flex-1 overflow-y-auto scroll-smooth" ref={scrollContainerRef}>
        <div className="px-5 py-4 space-y-0">
          {messages.map((msg, i) => (
            <div key={i} ref={(el) => (roundRefs.current[i] = el)}>
              {/* Separator between rounds */}
              {i > 0 && (
                <div className="border-t border-border-subtle my-0" />
              )}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: isDebating ? i * 0.8 : 0 }}
                className="py-4"
              >
                {/* Round pill badge */}
                <div className="mb-3">
                  <RoundBadge label={msg.label} color={color} />
                </div>

                {/* Body text — capped at ~65 chars */}
                <div className="text-[13px] leading-[1.7] text-text max-w-[65ch]">
                  {msg.text}
                </div>

                {/* Citation chip */}
                {msg.cite && (
                  <div className="mt-2">
                    <CitationChip text={msg.cite} />
                  </div>
                )}
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
