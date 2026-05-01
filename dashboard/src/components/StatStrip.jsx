import { useState, useEffect, memo } from 'react'
import { motion } from 'framer-motion'
import { Cpu, Zap, Activity } from 'lucide-react'

function jitter(base, range) {
  return base + Math.floor(Math.random() * range * 2) - range
}

const VITALS = [
  { key: 'rounds', value: '4', label: 'Rounds Completed', color: 'text-gmad-info' },
  { key: 'contradictions', value: '3', label: 'Contradictions Found', color: 'text-gmad-error' },
  { key: 'resolved', value: '3/3', label: 'Contradictions Resolved', color: 'text-gmad-success' },
  { key: 'open', value: '1', label: 'Open Items', color: 'text-gmad-warning' },
]

function TelemetryChip({ icon: Icon, label, value, iconColor }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={11} strokeWidth={2} className={iconColor} />
      <span className="text-[10px] text-gmad-muted uppercase tracking-wide">{label}</span>
      <span className="text-[11px] text-gmad-text font-mono font-semibold tabular-nums">{value}</span>
    </div>
  )
}

const StatStrip = memo(function StatStrip({ isVisible }) {
  const [tokens, setTokens] = useState(1024)
  const [latency, setLatency] = useState(42)

  useEffect(() => {
    const id = setInterval(() => {
      setTokens(prev => Math.min(8000, Math.max(900, jitter(prev, 64))))
      setLatency(jitter(43, 5))
    }, 3000)
    return () => clearInterval(id)
  }, [])

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex items-center justify-between px-5 py-3 shrink-0"
    >
      {/* Left — Debate Vitals */}
      <div className="flex items-center gap-3">
        {VITALS.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className="px-4 py-2.5 rounded-lg border border-gmad-border bg-gmad-panel"
          >
            <div className={`text-[20px] font-bold font-mono tabular-nums leading-none mb-1 ${card.color}`}>
              {card.value}
            </div>
            <div className="text-[10px] text-gmad-muted font-medium tracking-wide uppercase">
              {card.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Right — System Telemetry */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="flex items-center gap-4 px-4 py-2 rounded-lg border border-gmad-border bg-gmad-panel"
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-gmad-muted mr-1">SYS</span>
        <TelemetryChip icon={Cpu} label="VRAM" value="4.2 / 12 GB" iconColor="text-gmad-agent1" />
        <div className="w-px h-3 bg-gmad-border" />
        <TelemetryChip icon={Zap} label="Tokens" value={`${tokens.toLocaleString()} / 8k`} iconColor="text-gmad-success" />
        <div className="w-px h-3 bg-gmad-border" />
        <TelemetryChip icon={Activity} label="Latency" value={`${latency}ms`} iconColor="text-gmad-warning" />
      </motion.div>
    </motion.div>
  )
})

export default StatStrip
