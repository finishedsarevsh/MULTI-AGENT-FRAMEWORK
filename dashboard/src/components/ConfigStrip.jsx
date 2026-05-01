import { motion } from 'framer-motion'
import { Database } from 'lucide-react'

function ConfigEntry({ label, value }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-gmad-muted">{label}</span>
      <span className="text-gmad-text font-medium">{value}</span>
    </span>
  )
}

export default function ConfigStrip({ config }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 px-5 py-1.5 text-[11px] font-mono border-b border-gmad-border bg-gmad-bg/50 shrink-0"
    >
      <ConfigEntry label="Agent 1:" value={config.agent1Role} />
      <span className="text-gmad-border">│</span>
      <ConfigEntry label="Agent 2:" value={config.agent2Role} />
      <span className="text-gmad-border">│</span>
      <ConfigEntry label="Model:" value={config.model} />
      <span className="text-gmad-border">│</span>
      <ConfigEntry label="RAG:" value={
        <span className="inline-flex items-center gap-1">
          <Database size={9} className="text-gmad-citation" />
          chroma_db
        </span>
      } />
      <span className="text-gmad-border">│</span>
      <ConfigEntry label="Max Rounds:" value={config.maxRounds} />
    </motion.div>
  )
}
