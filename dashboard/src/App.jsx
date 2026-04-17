import { useState, useCallback } from 'react'
import { Settings, FileText } from 'lucide-react'
import Sidebar from './components/Sidebar'
import TranscriptInput from './components/TranscriptInput'
import AgentCard from './components/AgentCard'
import ConsensusJudge from './components/ConsensusJudge'

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

const PLANTUML_CODE = `@startuml
actor User
participant "Login Page" as LP
participant "Auth Service" as Auth
participant "MFA Module" as MFA

User -> LP : Enter credentials
LP -> Auth : POST /auth/login
Auth -> Auth : Validate input
alt Valid credentials
    Auth -> MFA : Request 2FA token
    MFA -> User : Send OTP
    User -> LP : Enter OTP
    LP -> Auth : POST /auth/verify
    Auth -> User : 200 OK + session
else Invalid credentials
    Auth -> LP : 401 Unauthorized
    LP -> User : Show error (generic)
end
@enduml`

const DEBATE_CONFIG = {
  'Agent 1 role': 'Business Analyst',
  'Agent 2 role': 'Software Architect',
  'Model': 'llama3',
  'RAG source': 'chroma_db (2 docs)',
  'Max rounds': '6',
  'intent': 'technical',
}

/* ── Topbar ── */
function Topbar() {
  return (
    <header className="flex items-center justify-between px-5 h-12 border-b border-border bg-surface shrink-0">
      <div className="flex items-center gap-4">
        <span className="font-mono font-semibold text-[15px] text-accent-blue tracking-tight">
          G-MAD
        </span>
        <div className="w-px h-[18px] bg-border" />
        <span className="text-[12px] text-text-muted">
          Multi-Agent Debate Tool
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-[7px] h-[7px] rounded-full bg-emerald-500" />
        <span className="font-mono text-[11px] text-text-dim">Ollama connected</span>
        <div className="w-px h-[18px] bg-border" />
        <button className="px-3 py-1 text-[12px] text-text-muted border border-border
                           hover:border-text-dim hover:text-text cursor-pointer transition-colors">
          <FileText size={12} strokeWidth={1.5} className="inline mr-1.5 -mt-px" />
          Docs
        </button>
        <button className="px-3 py-1 text-[12px] text-text-muted border border-border
                           hover:border-text-dim hover:text-text cursor-pointer transition-colors">
          <Settings size={12} strokeWidth={1.5} className="inline mr-1.5 -mt-px" />
          Settings
        </button>
      </div>
    </header>
  )
}

/* ── App ── */
export default function App() {
  const [query, setQuery] = useState(
    'Client wants a secure login page for a medical app. Analyze the requirement for contradictions, missing edge cases, and security gaps.'
  )
  const [isDebating, setIsDebating] = useState(false)
  const [debateComplete, setDebateComplete] = useState(false)
  const [agent1Msgs, setAgent1Msgs] = useState([])
  const [agent2Msgs, setAgent2Msgs] = useState([])
  const [agent1Score, setAgent1Score] = useState(0)
  const [agent2Score, setAgent2Score] = useState(0)

  const runDebate = useCallback(() => {
    if (isDebating || !query.trim()) return

    setIsDebating(true)
    setDebateComplete(false)
    setAgent1Msgs([])
    setAgent2Msgs([])
    setAgent1Score(0)
    setAgent2Score(0)

    // Simulate staggered message arrival
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

    // Complete debate after all messages arrive
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
  }, [])

  const metrics = debateComplete ? {
    iterations: 4,
    contradictions: 3,
    openItems: 1,
    plantuml: PLANTUML_CODE,
  } : null

  return (
    <div className="h-screen flex flex-col bg-bg">
      <Topbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar — fixed 220px */}
        <div className="w-[220px] shrink-0">
          <Sidebar onNewDebate={resetDebate} isDebating={isDebating} />
        </div>

        {/* Main workspace */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            {/* Query Panel — 280px */}
            <div className="w-[280px] shrink-0">
              <TranscriptInput
                query={query}
                setQuery={setQuery}
                config={DEBATE_CONFIG}
                onRun={runDebate}
                isDebating={isDebating}
                metrics={metrics}
              />
            </div>

            {/* Agent 1 */}
            <div className="flex-1 min-w-0">
              <AgentCard
                agentName="Agent 1"
                type="Business Analyst"
                confidenceScore={agent1Score}
                messages={agent1Msgs}
                color="blue"
                isDebating={isDebating}
              />
            </div>

            {/* Agent 2 */}
            <div className="flex-1 min-w-0">
              <AgentCard
                agentName="Agent 2"
                type="Software Architect"
                confidenceScore={agent2Score}
                messages={agent2Msgs}
                color="emerald"
                isDebating={isDebating}
                isLast={true}
              />
            </div>
          </div>

          {/* Consensus Judge Footer */}
          <ConsensusJudge
            verdict={VERDICT_TEXT}
            stats={{
              Rounds: '4',
              Contradictions: '3',
              Resolved: '3 / 3',
              'Open items': '1',
            }}
            isVisible={debateComplete}
          />
        </div>
      </div>
    </div>
  )
}
