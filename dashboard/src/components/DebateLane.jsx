import { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'

function SkeletonBlock() {
  return (
    <div className="space-y-3 p-5">
      {[1, 2, 3].map((n) => (
        <div key={n} className="space-y-2">
          <div className="skeleton h-4 w-32 rounded" />
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-4/5 rounded" />
          <div className="skeleton h-3 w-3/5 rounded" />
        </div>
      ))}
    </div>
  )
}

function CitationChip({ text }) {
  const match = text.match(/\[grounding:\s*(.+?)\]/)
  if (!match) return null
  return (
    <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-gmad-citation-dim text-gmad-citation text-[11px] font-mono font-medium cursor-pointer hover:bg-gmad-citation/20 transition-colors">
      <FileText size={10} strokeWidth={2} />{match[1]}
    </span>
  )
}

function AgreementBar({ score, color }) {
  const barColor = color === 'blue' ? 'bg-gmad-agent1' : 'bg-gmad-agent2'
  const barBg = color === 'blue' ? 'bg-gmad-agent1-dim' : 'bg-gmad-agent2-dim'
  const textColor = color === 'blue' ? 'text-gmad-agent1' : 'text-gmad-agent2'
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[11px] text-gmad-muted whitespace-nowrap">Agreement</span>
      <div className={`w-[72px] h-[5px] rounded-full ${barBg} overflow-hidden shrink-0`}>
        <motion.div className={`h-full rounded-full ${barColor}`} initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1.2, ease: 'easeOut' }} />
      </div>
      <span className={`font-mono text-[12px] font-bold tabular-nums shrink-0 ${textColor}`}>{score}%</span>
    </div>
  )
}

function JumpNav({ messages, onScrollTo, activeRound }) {
  if (messages.length === 0) return null
  return (
    <div className="flex items-center gap-1">
      {messages.map((_, i) => (
        <button key={i} onClick={() => onScrollTo(i)}
          className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded-full cursor-pointer transition-all
            ${activeRound === i ? 'bg-gmad-citation text-white' : 'text-gmad-muted hover:text-gmad-text hover:bg-gmad-card'}`}>
          R{i + 1}
        </button>
      ))}
    </div>
  )
}

export default function DebateLane({ agentName, role, messages, confidenceScore, color, isDebating, isLast = false }) {
  const scrollRef = useRef(null)
  const roundRefs = useRef([])

  const avatarBg = color === 'blue' ? 'bg-gmad-agent1-dim' : 'bg-gmad-agent2-dim'
  const avatarText = color === 'blue' ? 'text-gmad-agent1' : 'text-gmad-agent2'
  const roundAccent = color === 'blue' ? 'text-gmad-agent1' : 'text-gmad-agent2'
  const roundBorder = color === 'blue' ? 'border-gmad-agent1/20' : 'border-gmad-agent2/20'
  const roundBg = color === 'blue' ? 'bg-gmad-agent1-dim' : 'bg-gmad-agent2-dim'

  const handleScrollTo = useCallback((index) => {
    const el = roundRefs.current[index]
    if (el && scrollRef.current) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const showSkeleton = isDebating && messages.length === 0

  return (
    <div className={`flex flex-col h-full bg-gmad-panel rounded-lg border border-gmad-border overflow-hidden ${!isLast ? 'mr-3' : ''}`}>
      <div className="px-4 py-3 border-b border-gmad-border shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full ${avatarBg} flex items-center justify-center shrink-0`}>
              <span className={`text-[12px] font-bold ${avatarText}`}>{agentName.replace('Agent ', 'A')}</span>
            </div>
            <div>
              <div className="text-[13px] font-semibold text-gmad-text">{agentName}</div>
              <div className="text-[11px] text-gmad-muted">{role}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {messages.length > 0 && <span className="text-[11px] text-gmad-muted font-mono">{messages.length} rounds</span>}
            <AgreementBar score={confidenceScore} color={color} />
            <JumpNav messages={messages} onScrollTo={handleScrollTo} activeRound={messages.length - 1} />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scroll-smooth" ref={scrollRef}>
        {showSkeleton ? <SkeletonBlock /> : (
          <div className="p-5 space-y-0">
            {messages.map((msg, i) => (
              <div key={i} ref={(el) => (roundRefs.current[i] = el)}>
                {i > 0 && <div className="border-t border-gmad-border my-0" />}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: isDebating ? i * 0.4 : 0 }} className="py-4">
                  <div className="mb-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.06em] border ${roundAccent} ${roundBorder} ${roundBg}`}>{msg.label}</span>
                  </div>
                  <div className={`text-[14px] leading-[1.65] text-gmad-text/90 max-w-[65ch] ${isDebating && i === messages.length - 1 ? 'blink-cursor' : ''}`}>{msg.text}</div>
                  {msg.cite && <div className="mt-2"><CitationChip text={msg.cite} /></div>}
                </motion.div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
