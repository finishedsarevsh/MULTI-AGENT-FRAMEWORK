import React, { memo } from 'react'
import { motion } from 'framer-motion'

const StatStrip = memo(function StatStrip({ isVisible, evaluationMetrics, roundCount, sourceCount }) {
  if (!isVisible) return null

  // Catch the new data from the backend, fallback to 0 if loading
  const agreement = evaluationMetrics?.agreement_rate || 0
  const efficiency = evaluationMetrics?.convergence_efficiency || 0
  const quality = evaluationMetrics?.artifact_quality || 0

  const vitals = [
    {
      label: "Execution Steps",
      value: `${roundCount || 0} Rounds`,
      desc: "Debate depth required for consensus",
      color: "from-blue-500 to-indigo-600"
    },
    {
      label: "Consensus Agreement",
      value: `${agreement}%`,
      desc: "Live agent viewpoint alignment velocity",
      color: "from-teal-500 to-emerald-600"
    },
    {
      label: "Convergence Efficiency",
      value: `${efficiency}%`,
      desc: "F1 validation score optimized per round",
      color: "from-amber-500 to-orange-600"
    },
    {
      label: "Artifact Quality Index",
      value: `${quality}%`,
      desc: "Validates syntax, constraint coverage & consistency",
      color: "from-purple-500 to-fuchsia-600"
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-900 border-b border-slate-800 shrink-0 w-full"
    >
      {vitals.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: idx * 0.06 }}
          className="relative p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-lg"
        >
          <div className="z-10 relative">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{item.label}</span>
            <h3 className={`text-2xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent mt-1`}>
              {item.value}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
          </div>
          {/* Decorative glowing orb in the corner of each card */}
          <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${item.color} opacity-[0.08] blur-xl rounded-full`} />
        </motion.div>
      ))}
    </motion.div>
  )
})

export default StatStrip