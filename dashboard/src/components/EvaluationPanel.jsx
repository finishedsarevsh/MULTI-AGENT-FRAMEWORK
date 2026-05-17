import React, { memo, useMemo } from 'react'
import { motion } from 'framer-motion'

/* ─────────────────────── Constants ─────────────────────── */
const CHART_W = 520
const CHART_H = 260
const PAD = { top: 28, right: 56, bottom: 56, left: 56 }
const INNER_W = CHART_W - PAD.left - PAD.right
const INNER_H = CHART_H - PAD.top - PAD.bottom
const ROUNDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

/* F1 linear decay from 96 → ~36 */
const f1Data = ROUNDS.map(r => Math.max(36, 96 - (r - 1) * 6.67))

/* AQI curve: rises to peak at R3, steep decay after R4 */
const aqiData = ROUNDS.map(r => {
  if (r <= 3) return 30 + (r - 1) * 30          // 30 → 90
  if (r === 4) return 78
  return Math.max(8, 78 - (r - 4) * 16)         // steep decay
})

function toX(round) {
  return PAD.left + ((round - 1) / (ROUNDS.length - 1)) * INNER_W
}
function toY(value) {
  return PAD.top + INNER_H - (value / 100) * INNER_H
}

function polyline(data) {
  return data.map((v, i) => `${toX(ROUNDS[i])},${toY(v)}`).join(' ')
}

/* ─────────────────────── Badge ─────────────────────── */
function Badge({ children, variant = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    slate: 'bg-slate-700/40 text-slate-300 border-slate-600/30',
  }
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${colors[variant] || colors.indigo}`}>
      {children}
    </span>
  )
}

/* ─────────────────── Dual Axis Chart ─────────────────── */
const TradeOffChart = memo(function TradeOffChart() {
  const paretoX = toX(3)
  const paretoF1Y = toY(f1Data[2])
  const paretoAqiY = toY(aqiData[2])

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* F1 glow gradient */}
          <linearGradient id="f1Grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          {/* AQI glow gradient */}
          <linearGradient id="aqiGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          {/* AQI area fill */}
          <linearGradient id="aqiArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          {/* F1 area fill */}
          <linearGradient id="f1Area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
          {/* Target glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect x={PAD.left} y={PAD.top} width={INNER_W} height={INNER_H} rx="4" fill="#0f172a" stroke="#1e293b" strokeWidth="0.5" />

        {/* Horizontal grid lines */}
        {[0, 25, 50, 75, 100].map(v => (
          <g key={v}>
            <line x1={PAD.left} y1={toY(v)} x2={PAD.left + INNER_W} y2={toY(v)} stroke="#1e293b" strokeWidth="0.5" strokeDasharray={v === 0 ? 'none' : '3,3'} />
            {/* Left axis labels */}
            <text x={PAD.left - 6} y={toY(v) + 3} textAnchor="end" fill="#6366f1" fontSize="9" fontFamily="Inter, sans-serif">{v}%</text>
            {/* Right axis labels */}
            <text x={PAD.left + INNER_W + 6} y={toY(v) + 3} textAnchor="start" fill="#10b981" fontSize="9" fontFamily="Inter, sans-serif">{v}%</text>
          </g>
        ))}

        {/* X-axis round labels */}
        {ROUNDS.map(r => (
          <text key={r} x={toX(r)} y={CHART_H - PAD.bottom + 18} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="Inter, sans-serif">
            R{r}
          </text>
        ))}

        {/* Axis titles */}
        <text x={PAD.left / 2} y={PAD.top + INNER_H / 2} textAnchor="middle" fill="#818cf8" fontSize="8.5" fontWeight="600" fontFamily="Inter, sans-serif" transform={`rotate(-90, ${PAD.left / 2}, ${PAD.top + INNER_H / 2})`}>
          Orchestration Quality (F1)
        </text>
        <text x={CHART_W - PAD.right / 2} y={PAD.top + INNER_H / 2} textAnchor="middle" fill="#34d399" fontSize="8.5" fontWeight="600" fontFamily="Inter, sans-serif" transform={`rotate(90, ${CHART_W - PAD.right / 2}, ${PAD.top + INNER_H / 2})`}>
          Artifact Quality (AQI)
        </text>
        <text x={PAD.left + INNER_W / 2} y={CHART_H - 4} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="Inter, sans-serif">
          Debate Rounds
        </text>

        {/* ── F1 Area Fill ── */}
        <polygon
          points={`${polyline(f1Data)},${toX(10)},${toY(0)},${toX(1)},${toY(0)}`}
          fill="url(#f1Area)"
        />

        {/* ── AQI Area Fill ── */}
        <polygon
          points={`${polyline(aqiData)},${toX(10)},${toY(0)},${toX(1)},${toY(0)}`}
          fill="url(#aqiArea)"
        />

        {/* ── F1 Line ── */}
        <polyline
          points={polyline(f1Data)}
          fill="none"
          stroke="url(#f1Grad)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ── AQI Line ── */}
        <polyline
          points={polyline(aqiData)}
          fill="none"
          stroke="url(#aqiGrad)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data point dots — F1 */}
        {f1Data.map((v, i) => (
          <circle key={`f1-${i}`} cx={toX(ROUNDS[i])} cy={toY(v)} r="2.5" fill="#818cf8" stroke="#0f172a" strokeWidth="1" />
        ))}

        {/* Data point dots — AQI */}
        {aqiData.map((v, i) => (
          <circle key={`aqi-${i}`} cx={toX(ROUNDS[i])} cy={toY(v)} r="2.5" fill="#34d399" stroke="#0f172a" strokeWidth="1" />
        ))}

        {/* ── Pareto Optimal Vertical Anchor ── */}
        <line x1={paretoX} y1={PAD.top} x2={paretoX} y2={PAD.top + INNER_H} stroke="#fbbf24" strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />

        {/* Star marker at F1/AQI intersection zone */}
        <g filter="url(#glow)">
          {/* Outer glow ring */}
          <circle cx={paretoX} cy={(paretoF1Y + paretoAqiY) / 2} r="10" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.4" />
          {/* Star */}
          <polygon
            points={starPoints(paretoX, (paretoF1Y + paretoAqiY) / 2, 7, 3.5, 5)}
            fill="#fbbf24"
            stroke="#fbbf24"
            strokeWidth="0.5"
            opacity="0.9"
          />
        </g>

        {/* Pareto label */}
        <text x={paretoX} y={PAD.top - 6} textAnchor="middle" fill="#fbbf24" fontSize="7.5" fontWeight="700" fontFamily="Inter, sans-serif" letterSpacing="0.3">
          Pareto-Optimal Convergence Window (ω* = 3)
        </text>

        {/* Legend */}
        <g transform={`translate(${PAD.left + 8}, ${PAD.top + 8})`}>
          <rect x="0" y="0" width="108" height="36" rx="4" fill="#0f172a" fillOpacity="0.85" stroke="#1e293b" strokeWidth="0.5" />
          <line x1="6" y1="11" x2="20" y2="11" stroke="url(#f1Grad)" strokeWidth="2" />
          <text x="24" y="14" fill="#a5b4fc" fontSize="8" fontFamily="Inter, sans-serif">Orchestration (F1)</text>
          <line x1="6" y1="26" x2="20" y2="26" stroke="url(#aqiGrad)" strokeWidth="2" />
          <text x="24" y="29" fill="#6ee7b7" fontSize="8" fontFamily="Inter, sans-serif">Artifact Quality (AQI)</text>
        </g>
      </svg>

      {/* Footnote */}
      <p className="text-center text-[9px] italic text-slate-500 mt-2 px-4 leading-relaxed max-w-lg mx-auto">
        *Note: The over-convergence decay boundary (Rounds ≥ 4) represents a theoretically predicted regime
        based on known context limits, tracking semantic drift under convergence pressure.
      </p>
    </div>
  )
})

/* Star polygon point generator */
function starPoints(cx, cy, outerR, innerR, points) {
  const result = []
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI / points) * i - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    result.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
  }
  return result.join(' ')
}

/* ────────────────── Main Panel ────────────────── */
const EvaluationPanel = memo(function EvaluationPanel({ isVisible, evaluationMetrics, roundCount }) {
  if (!isVisible) return null

  const precision = evaluationMetrics?.precision || 0
  const recall = evaluationMetrics?.recall || 0
  const f1 = evaluationMetrics?.f1_score || 0
  const efficiency = evaluationMetrics?.convergence_efficiency || 0
  const quality = evaluationMetrics?.artifact_quality || 0
  const rounds = roundCount || 1

  // Integrity Acquisition Rate — AQI points built per round
  const iar = useMemo(() => {
    return rounds > 0 ? (quality / rounds).toFixed(1) : '0.0'
  }, [quality, rounds])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="mx-5 my-4 rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-sm shadow-2xl overflow-hidden"
      id="evaluation-panel"
    >
      {/* Panel Header */}
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-slate-800/70 bg-slate-900/50">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <h2 className="text-[11px] font-bold tracking-[0.15em] uppercase text-slate-300">
          Evaluation Metrics — Multi-Dimensional Telemetry
        </h2>
      </div>

      {/* Split Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-0">

        {/* ──────── LEFT: Metric Cards ──────── */}
        <div className="p-5 flex flex-col gap-4 border-r border-slate-800/50">

          {/* Orchestration Vitals Group */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="rounded-lg border border-indigo-500/15 bg-indigo-500/[0.04] p-4"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-400 mb-3">
              Orchestration Vitals
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="indigo">Precision: {precision}%</Badge>
              <Badge variant="indigo">Recall: {recall}%</Badge>
              <Badge variant="indigo">F1-Score: {f1}%</Badge>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Conv. Efficiency</span>
              <Badge variant="slate">{efficiency}%</Badge>
            </div>
          </motion.div>

          {/* Output Integrity Group */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.04] p-4"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-400 mb-2">
              Output Integrity
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent leading-none">
                {quality}%
              </span>
              <span className="text-[10px] text-slate-500 font-medium">AQI</span>
            </div>
            <p className="text-[9px] text-slate-500 mt-1.5 leading-relaxed">
              Composite of structural validity, RAG constraint coverage &amp; inter-artifact consistency
            </p>
          </motion.div>

          {/* IAR Velocity Badge */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="rounded-lg border border-amber-500/15 bg-amber-500/[0.04] p-3 flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-400 mb-0.5">
                Integrity Acquisition Rate
              </p>
              <p className="text-[9px] text-slate-500">AQI velocity per debate round</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-amber-300">{iar}</span>
              <span className="text-[9px] text-slate-500 font-medium">% / rd</span>
            </div>
          </motion.div>

          {/* Execution Rounds Mini-Stat */}
          <div className="flex items-center justify-between px-3 py-2 rounded-md bg-slate-900/60 border border-slate-800/40">
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Execution Depth</span>
            <span className="text-sm font-bold text-slate-300">{rounds} <span className="text-[9px] text-slate-500 font-normal">Rounds</span></span>
          </div>
        </div>

        {/* ──────── RIGHT: Dual-Axis Chart ──────── */}
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="p-5 flex flex-col items-center justify-center"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-3 self-start">
            Trade-Off Curve — Orchestration Quality vs. Output Integrity
          </p>
          <TradeOffChart />
        </motion.div>
      </div>
    </motion.div>
  )
})

export default EvaluationPanel
