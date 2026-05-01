import { FileText } from 'lucide-react'
import { motion } from 'framer-motion'

const RAG_SOURCES = [
  { filename: 'IEEE-2025-security-patterns.pdf', relevance: 94 },
  { filename: 'HIPAA-compliance-checklist.md', relevance: 87 },
]

export default function FooterBar({ isVisible }) {
  if (!isVisible) return null

  return (
    <motion.footer
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="shrink-0 flex items-center gap-4 px-5 py-1.5 border-t border-gmad-border bg-gmad-bg"
    >
      <span className="text-[10px] uppercase tracking-[0.08em] font-bold text-gmad-muted">RAG Source Relevance</span>
      <div className="flex items-center gap-3">
        {RAG_SOURCES.map((src) => (
          <div key={src.filename} className="flex items-center gap-2">
            <FileText size={10} strokeWidth={1.8} className="text-gmad-citation" />
            <span className="text-[11px] font-mono text-gmad-muted">{src.filename}</span>
            <span className="text-[10px] font-mono text-gmad-success font-semibold tabular-nums">{src.relevance}%</span>
          </div>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <div className="w-[5px] h-[5px] rounded-full bg-gmad-success animate-pulse" />
        <span className="text-[10px] text-gmad-muted font-mono">chroma_db connected</span>
      </div>
    </motion.footer>
  )
}
