import { useState, useCallback, useRef } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import StatStrip from './components/StatStrip'
import EvaluationPanel from './components/EvaluationPanel'
import QueryBar from './components/QueryBar'
import ConfigStrip from './components/ConfigStrip'
import ConsensusVerdict from './components/ConsensusVerdict'
import DebateLane from './components/DebateLane'
// Phase 2: import FooterBar from './components/FooterBar'
import { generatePlantUmlString } from './utils/plantUmlParser'
import plantumlEncoder from 'plantuml-encoder'

/* ── API Configuration ── */
const API_URL = 'http://127.0.0.1:8000/api/debate'

/* ── App ── */
export default function App() {
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)

  /* ── Single unified text state ── */
  const [transcript, setTranscript] = useState('')
  const [isDebating, setIsDebating] = useState(false)
  const [debateComplete, setDebateComplete] = useState(false)
  const [agent1Msgs, setAgent1Msgs] = useState([])
  const [agent2Msgs, setAgent2Msgs] = useState([])
  const [agent1Score, setAgent1Score] = useState(0)
  const [agent2Score, setAgent2Score] = useState(0)
  const [umlDiagramUrl, setUmlDiagramUrl] = useState(null)
  const [contextFiles, setContextFiles] = useState([])
  const [verdictText, setVerdictText] = useState('')
  const [debateError, setDebateError] = useState(null)
  const [debateRounds, setDebateRounds] = useState(0)
  const [evaluationMetrics, setEvaluationMetrics] = useState(null)

  const [config] = useState({
    agent1Role: 'Software Architect',
    agent2Role: 'Business Analyst',
    model: 'llama3',
    maxRounds: 3,
    intent: 'technical',
  })

  const resetDebate = useCallback(() => {
    setTranscript('')
    setIsDebating(false)
    setDebateComplete(false)
    setAgent1Msgs([])
    setAgent2Msgs([])
    setAgent1Score(0)
    setAgent2Score(0)
    setUmlDiagramUrl(null)
    setContextFiles([])
    setVerdictText('')
    setDebateError(null)
    setDebateRounds(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  // ── File Handling ──
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files)
    setContextFiles(prev => [...prev, ...newFiles])
    // Reset the native input so the same file can be re-selected if removed
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (index) => {
    setContextFiles(prev => prev.filter((_, i) => i !== index))
  }

  // ── Unified Debate Submission ──
  const runDebate = useCallback(async () => {
    if (isDebating || !transcript.trim()) return

    console.log('[G-MAD] SUBMITTING TO BACKEND:', transcript)

    setIsDebating(true)
    setDebateComplete(false)
    setDebateError(null)
    setAgent1Msgs([])
    setAgent2Msgs([])
    setAgent1Score(0)
    setAgent2Score(0)
    setUmlDiagramUrl(null)
    setVerdictText('')
    setDebateRounds(0)

    // Build multipart payload
    const formData = new FormData()
    formData.append('transcript', transcript)
    contextFiles.forEach((file) => {
      formData.append('context_files', file)
    })

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('[G-MAD UI] Received data package:', JSON.stringify(data, null, 2))

      // ── Safe text extractor — handles string, object, or unknown shapes ──
      const safeText = (entry) => {
        if (typeof entry === 'string') return entry
        if (entry && typeof entry === 'object') return entry.text || entry.content || entry.message || JSON.stringify(entry)
        return String(entry ?? '')
      }

      // ── Parse response (nested try so loading states ALWAYS reset) ──
      try {
        // ── Analyst critiques → Agent 2 lane ──
        const analystMsgs = []
        const critiques = Array.isArray(data.analyst_critiques) ? data.analyst_critiques
          : Array.isArray(data.debate_history) ? data.debate_history
          : []

        critiques.forEach((entry, i) => {
          const raw = safeText(entry)
          const cleanText = raw.replace(/^\[Round \d+\] ANALYST:\s*/i, '')
          analystMsgs.push({
            label: `Round ${i + 1} — Analyst Critique`,
            text: cleanText,
          })
        })

        // ── Architecture → Agent 1 lane ──
        const architectMsgs = []
        const arch = data.architecture || {}
        const components = Array.isArray(arch.components) ? arch.components : []
        const relationships = Array.isArray(arch.relationships) ? arch.relationships : []
        const compCount = components.length
        const relCount = relationships.length

        architectMsgs.push({
          label: 'Architecture Draft',
          text: `System: ${arch.systemName || 'N/A'}\n` +
                `Components (${compCount}): ${components.map(c => c?.name || 'unnamed').join(', ')}\n` +
                `Relationships (${relCount}): ${relationships.map(r => `${r?.source || '?'} -> ${r?.target || '?'}`).join(', ')}`,
        })

        setAgent1Msgs(architectMsgs)
        setAgent2Msgs(analystMsgs)
        setAgent1Score(data.consensus_reached ? 92 : 70)
        setAgent2Score(data.consensus_reached ? 88 : 65)
        setDebateRounds(data.debate_rounds || 0)
        if (data.evaluation) setEvaluationMetrics(data.evaluation)

        // ── Verdict ──
        const lastCritique = analystMsgs.length > 0 ? analystMsgs[analystMsgs.length - 1].text.slice(0, 300) : ''
        const verdict = data.consensus_reached
          ? `Consensus reached after ${data.debate_rounds} round(s). ` +
            `The final architecture contains ${compCount} components and ${relCount} relationships. ` +
            lastCritique
          : `No consensus after ${data.debate_rounds} round(s). The debate was capped at the maximum iteration limit.`
        setVerdictText(verdict)

        // ── PlantUML diagram ──
        try {
          if (arch.plantuml) {
            const encoded = plantumlEncoder.encode(String(arch.plantuml).trim())
            setUmlDiagramUrl(`https://www.plantuml.com/plantuml/svg/${encoded}`)
            console.log('[G-MAD] Using LLM-generated PlantUML diagram')
          } else if (compCount > 0) {
            const umlString = generatePlantUmlString(arch)
            const encoded = plantumlEncoder.encode(umlString)
            setUmlDiagramUrl(`https://www.plantuml.com/plantuml/svg/${encoded}`)
            console.log('[G-MAD] Using auto-generated PlantUML (no LLM diagram found)')
          }
        } catch (umlErr) {
          console.warn('[G-MAD] PlantUML generation failed (non-fatal):', umlErr)
          // Diagram failure is non-fatal — debate results still render
        }

      } catch (parseErr) {
        console.error('[G-MAD] Response parsing failed (non-fatal):', parseErr)
        setDebateError(`Response parsed but rendering failed: ${parseErr.message}`)
      }

      // ── Always mark debate as complete after a 200 OK ──
      setDebateComplete(true)

    } catch (err) {
      console.error('[G-MAD] Debate submission failed:', err)
      setDebateError(err.message || 'Unknown error')
    } finally {
      setIsDebating(false)
    }
  }, [isDebating, transcript, contextFiles])

  return (
    <div className="h-screen flex bg-gmad-bg">
      {/* ── Left Sidebar (220px) ── */}
      <div className="w-[220px] shrink-0">
        <Sidebar onNewDebate={resetDebate} isDebating={isDebating} />
      </div>

      {/* ── Main Content (full remaining width) ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />

        {/* Zone 1 — Metrics Row (legacy cards) */}
        <StatStrip 
          isVisible={debateComplete}
          evaluationMetrics={evaluationMetrics}
          roundCount={debateRounds}
          sourceCount={contextFiles.length}
        />

        {/* Zone 2 — Unified Smart Input */}
        <QueryBar
          ref={inputRef}
          transcript={transcript}
          setTranscript={setTranscript}
          contextFiles={contextFiles}
          onFileChange={handleFileChange}
          onRemoveFile={removeFile}
          fileInputRef={fileInputRef}
          onRun={runDebate}
          isDebating={isDebating}
        />

        {/* Zone 3 — Config Strip */}
        <ConfigStrip config={config} />

        {/* Scrollable workspace */}
        <div className="flex-1 overflow-y-auto min-h-0">

          {/* ── Error Banner ── */}
          {debateError && (
            <div className="mx-5 mt-4 mb-2 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-[13px]">
              <strong>Debate Failed:</strong> {debateError}
            </div>
          )}

          {/* ── Loading Spinner Overlay ── */}
          {isDebating && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-10 h-10 border-[3px] border-gmad-border border-t-blue-500 rounded-full animate-spin" />
              <p className="text-[13px] text-gmad-muted">Running multi-agent debate (this may take a minute)...</p>
            </div>
          )}

          {/* Consensus Verdict */}
          <ConsensusVerdict
            verdict={verdictText}
            stats={{ Rounds: String(debateRounds), ragSources: contextFiles.length }}
            isVisible={debateComplete}
          />

          {/* Research-Grade Evaluation Panel */}
          <EvaluationPanel
            isVisible={debateComplete}
            evaluationMetrics={evaluationMetrics}
            roundCount={debateRounds}
          />

          {/* ── UML Architecture Diagram ── */}
          {umlDiagramUrl && (
            <div
              className="relative z-10 mx-5 mb-4 rounded-lg border border-gmad-border bg-gmad-card overflow-auto"
              style={{ padding: '1rem' }}
            >
              <p className="text-[11px] font-bold uppercase tracking-widest text-gmad-muted mb-3">
                🏗 Architecture Diagram (PlantUML)
              </p>
              <img
                id="uml-diagram-img"
                src={umlDiagramUrl}
                alt="System Architecture Diagram"
                className="max-w-full h-auto block mx-auto"
                style={{ minHeight: '120px' }}
              />
            </div>
          )}

          {/* Debate Lanes — strict 50/50 split, full width */}
          <div className="grid grid-cols-2 gap-3 px-5 pb-5" style={{ minHeight: 0 }}>
            <DebateLane
              agentName="Agent 1"
              role={config.agent1Role}
              messages={agent1Msgs}
              confidenceScore={agent1Score}
              color="blue"
              isDebating={isDebating}
              isDraftLane={true}
            />
            <DebateLane
              agentName="Agent 2"
              role={config.agent2Role}
              messages={agent2Msgs}
              confidenceScore={agent2Score}
              color="amber"
              isDebating={isDebating}
            />
          </div>
        </div>

        {/* Phase 2 – Footer RAG Source Relevance (commented out for academic integrity)
        <FooterBar isVisible={debateComplete} />
        */}
      </div>
    </div>
  )
}
