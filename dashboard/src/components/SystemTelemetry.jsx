import { useState, useEffect, memo } from 'react'
import { Cpu, Zap, Activity } from 'lucide-react'

function jitter(base, range) {
  return base + Math.floor(Math.random() * range * 2) - range
}

const SystemTelemetry = memo(function SystemTelemetry() {
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
    <div className="flex items-center gap-3 border-l border-border pl-3">
      {/* VRAM */}
      <div className="flex items-center gap-1.5">
        <Cpu size={10} strokeWidth={2} className="text-accent-blue" />
        <span className="font-mono text-[10px] text-text-dim">VRAM</span>
        <span className="font-mono text-[10px] text-text-muted">4.2 / 12 GB</span>
      </div>

      {/* Tokens */}
      <div className="flex items-center gap-1.5">
        <Zap size={10} strokeWidth={2} className="text-accent-emerald" />
        <span className="font-mono text-[10px] text-text-dim">TOK</span>
        <span className="font-mono text-[10px] text-text-muted tabular-nums">
          {tokens.toLocaleString()} / 8k
        </span>
      </div>

      {/* Latency */}
      <div className="flex items-center gap-1.5">
        <Activity size={10} strokeWidth={2} className="text-amber-500" />
        <span className="font-mono text-[10px] text-text-dim">LAT</span>
        <span className="font-mono text-[10px] text-text-muted tabular-nums">
          {latency}ms
        </span>
      </div>
    </div>
  )
})

export default SystemTelemetry
