import { useState, useEffect, memo } from 'react'
import { Cpu, Zap, Activity } from 'lucide-react'

function jitter(base, range) {
  return base + Math.floor(Math.random() * range * 2) - range
}

/* ── Metric Chip — readable key/value at 12–13px ── */
function MetricChip({ icon: Icon, label, value, iconColor }) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-surface-raised border border-border-subtle">
      <Icon size={13} strokeWidth={2} className={iconColor} />
      <span className="text-[12px] text-text-dim font-medium">{label}</span>
      <span className="text-[13px] text-text font-semibold font-mono tabular-nums">
        {value}
      </span>
    </div>
  )
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
    <div className="flex items-center gap-2">
      <MetricChip
        icon={Cpu}
        label="VRAM"
        value="4.2 / 12 GB"
        iconColor="text-accent-blue"
      />
      <MetricChip
        icon={Zap}
        label="Tokens"
        value={`${tokens.toLocaleString()} / 8k`}
        iconColor="text-accent-emerald"
      />
      <MetricChip
        icon={Activity}
        label="Latency"
        value={`${latency}ms`}
        iconColor="text-semantic-warning"
      />
    </div>
  )
})

export default SystemTelemetry
