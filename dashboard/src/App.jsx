import { useState, useCallback, useRef } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import StatStrip from './components/StatStrip'
import QueryBar from './components/QueryBar'
import ConfigStrip from './components/ConfigStrip'
import ConsensusVerdict from './components/ConsensusVerdict'
import DebateLane from './components/DebateLane'
import FooterBar from './components/FooterBar'

/* ── Demo Data ── */
const AGENT_1_MESSAGES = [
  {
    label: 'Round 1 — Feature suggestions',
    text: 'The login page should support email/password authentication with a "Remember Me" option. For a medical app, we need HIPAA-compliant session timeouts (15 min idle). Password requirements: minimum 12 characters, mixed case, at least one special character. Consider adding biometric login for mobile users.',
  },
  {
    label: 'Round 2 — Responding to critique',
    text: 'Good point on the brute-force vector. I\'ll add: account lockout after 5 failed attempts with exponential backoff. The "Remember Me" feature should use a secure, rotating refresh token — not a persistent session. Agreed that the password policy should also block known-compromised passwords via a breach database check.',
  },
  {
    label: 'Round 3 — Final position',
    text: 'Updated requirements: MFA is mandatory (not optional). Session tokens must be short-lived (15 min) with server-side invalidation. The login error message must be generic ("Invalid credentials") to prevent user enumeration. Added rate limiting at the API gateway level.',
  },
]

const AGENT_2_MESSAGES = [
  {
    label: 'Round 1 — Security review',
    text: 'The Analyst omitted brute-force protection entirely. "Remember Me" as described is a session-hijacking risk in a medical context. The password policy is adequate but should also cross-reference HaveIBeenPwned. More critically: there is no mention of MFA, which is a baseline requirement for any app handling PHI.',
  },
  {
    label: 'Round 2 — Architecture constraints',
    text: 'Exponential backoff is correct. However, the refresh token rotation must be paired with server-side token invalidation — client-side only is insufficient. I\'d also flag: the original requirement says nothing about API rate limiting, which leaves the auth endpoint open to credential-stuffing attacks. This is a gap in the source document itself.',
    cite: '[grounding: IEEE-2025-security-patterns.pdf]',
  },
  {
    label: 'Round 3 — Consensus position',
    text: 'We now agree on the core controls. The remaining open item: the original requirement does not specify whether the app needs offline login capability (relevant for field medical staff). This should be escalated to the client as an unanswered question, not assumed either way.',
  },
]

const VERDICT_TEXT = `Both agents agree on the following controls for the medical app login: mandatory MFA, HIPAA-compliant 15-minute session timeout with server-side invalidation, generic error messages to prevent user enumeration, exponential-backoff account lockout, and API-level rate limiting. The password policy includes a 12-character minimum with breach-database cross-referencing [grounding: IEEE-2025-security-patterns.pdf]. One unresolved item remains: the source requirement does not specify offline login capability for field medical staff. This has been flagged for client clarification.`

/* ── App ── */
export default function App() {
  const queryInputRef = useRef(null)

  const [query, setQuery] = useState(
    'Client wants a secure login page for a medical app. Analyze the requirement for contradictions, missing edge cases, and security gaps.'
  )
  const [isDebating, setIsDebating] = useState(false)
  const [debateComplete, setDebateComplete] = useState(false)
  const [agent1Msgs, setAgent1Msgs] = useState([])
  const [agent2Msgs, setAgent2Msgs] = useState([])
  const [agent1Score, setAgent1Score] = useState(0)
  const [agent2Score, setAgent2Score] = useState(0)

  const [config] = useState({
    agent1Role: 'Business Analyst',
    agent2Role: 'Software Architect',
    model: 'llama3',
    maxRounds: 3,
    intent: 'technical',
  })

  const runDebate = useCallback(() => {
    if (isDebating || !query.trim()) return

    setIsDebating(true)
    setDebateComplete(false)
    setAgent1Msgs([])
    setAgent2Msgs([])
    setAgent1Score(0)
    setAgent2Score(0)

    AGENT_1_MESSAGES.forEach((msg, i) => {
      setTimeout(() => {
        setAgent1Msgs(prev => [...prev, msg])
        setAgent1Score(Math.round((84 / AGENT_1_MESSAGES.length) * (i + 1)))
      }, (i + 1) * 1200)
    })

    AGENT_2_MESSAGES.forEach((msg, i) => {
      setTimeout(() => {
        setAgent2Msgs(prev => [...prev, msg])
        setAgent2Score(Math.round((78 / AGENT_2_MESSAGES.length) * (i + 1)))
      }, (i + 1) * 1400)
    })

    const totalTime = Math.max(
      AGENT_1_MESSAGES.length * 1200,
      AGENT_2_MESSAGES.length * 1400
    ) + 800

    setTimeout(() => {
      setAgent1Score(84)
      setAgent2Score(78)
      setIsDebating(false)
      setDebateComplete(true)
    }, totalTime)
  }, [isDebating, query])

  const resetDebate = useCallback(() => {
    setQuery('')
    setIsDebating(false)
    setDebateComplete(false)
    setAgent1Msgs([])
    setAgent2Msgs([])
    setAgent1Score(0)
    setAgent2Score(0)
    setTimeout(() => queryInputRef.current?.focus(), 50)
  }, [])

  return (
    <div className="h-screen flex bg-gmad-bg">
      {/* ── Left Sidebar (220px) ── */}
      <div className="w-[220px] shrink-0">
        <Sidebar onNewDebate={resetDebate} isDebating={isDebating} />
      </div>

      {/* ── Main Content (full remaining width) ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />

        {/* Zone 1 — Metrics Row */}
        <StatStrip isVisible={debateComplete} />

        {/* Zone 2 — Intent / Query Bar */}
        <QueryBar
          ref={queryInputRef}
          query={query}
          setQuery={setQuery}
          onRun={runDebate}
          isDebating={isDebating}
        />

        {/* Zone 3 — Config Strip */}
        <ConfigStrip config={config} />

        {/* Scrollable workspace */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Consensus Verdict */}
          <ConsensusVerdict
            verdict={VERDICT_TEXT}
            stats={{ Rounds: '4' }}
            isVisible={debateComplete}
          />

          {/* Debate Lanes — strict 50/50 split, full width */}
          <div className="grid grid-cols-2 gap-3 px-5 pb-5" style={{ minHeight: 0 }}>
            <DebateLane
              agentName="Agent 1"
              role={config.agent1Role}
              messages={agent1Msgs}
              confidenceScore={agent1Score}
              color="blue"
              isDebating={isDebating}
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

        {/* Footer — RAG Source Relevance */}
        <FooterBar isVisible={debateComplete} />
      </div>
    </div>
  )
}
