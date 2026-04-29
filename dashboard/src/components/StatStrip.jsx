import { motion } from 'framer-motion'

const CARDS = [
  { key: 'rounds', value: '4', label: 'Rounds Completed', color: 'text-gmad-info', border: 'border-gmad-info/20' },
  { key: 'contradictions', value: '3', label: 'Contradictions Found', color: 'text-gmad-error', border: 'border-gmad-error/20' },
  { key: 'resolved', value: '3/3', label: 'Contradictions Resolved', color: 'text-gmad-success', border: 'border-gmad-success/20' },
  { key: 'open', value: '1', label: 'Open Items', color: 'text-gmad-warning', border: 'border-gmad-warning/20' },
]

export default function StatStrip({ isVisible }) {
  if (!isVisible) return null
  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="grid grid-cols-4 gap-3 px-5 py-3 shrink-0">
      {CARDS.map((card, i) => (
        <motion.div key={card.key} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: i * 0.06 }} className={`px-4 py-3 rounded-lg border bg-gmad-panel ${card.border}`}>
          <div className={`text-[22px] font-bold font-mono tabular-nums leading-none mb-1.5 ${card.color}`}>{card.value}</div>
          <div className="text-[11px] text-gmad-muted font-medium tracking-wide">{card.label}</div>
        </motion.div>
      ))}
    </motion.div>
  )
}
