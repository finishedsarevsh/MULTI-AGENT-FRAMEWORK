import { motion } from 'framer-motion'

function StreamingText({ text, isStreaming }) {
  if (!isStreaming) {
    return <span>{text}</span>
  }

  return (
    <span>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.008, duration: 0.02 }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  )
}

function ConfidenceBar({ score, color, animate }) {
  return (
    <div className="px-4 py-3 border-t border-border bg-surface shrink-0">
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-text-dim">
          Confidence
        </span>
        <span className="font-mono text-[12px] font-medium text-text">
          {score}%
        </span>
      </div>
      <div className="w-full h-[3px] bg-border">
        <motion.div
          className="h-full"
          style={{ background: color }}
          initial={animate ? { width: 0 } : { width: `${score}%` }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.8, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
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
  const dimBg = color === 'blue' ? 'bg-accent-blue-dim' : 'bg-accent-emerald-dim'

  return (
    <div className={`flex flex-col h-full ${!isLast ? 'border-r border-border' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-2">
          <div
            className="w-[6px] h-[6px] rounded-full"
            style={{ background: accentColor }}
          />
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
            {agentName} — {type}
          </span>
        </div>
        <span className="font-mono text-[10px] text-text-dim">
          {messages.length} responses
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: isDebating ? i * 0.8 : 0 }}
            className="p-3 bg-bg border border-border"
          >
            <div
              className="font-mono text-[10px] font-medium uppercase tracking-[0.05em] mb-1.5"
              style={{ color: accentColor }}
            >
              {msg.label}
            </div>
            <div className="text-[13px] leading-[1.6] text-text">
              <StreamingText text={msg.text} isStreaming={isDebating} />
            </div>
            {msg.cite && (
              <div className="mt-2 font-mono text-[11px] opacity-70" style={{ color: accentColor }}>
                {msg.cite}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Confidence */}
      <ConfidenceBar score={confidenceScore} color={accentColor} animate={isDebating} />
    </div>
  )
}
