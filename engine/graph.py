"""
G-MAD LangGraph Debate Engine
==============================
A cyclic StateGraph that orchestrates a structured multi-agent debate
between an **Architect** (drafts functional requirements & system
components) and an **Analyst** (critiques for NFRs, security, and edge
cases), overseen by a **Judge** who decides whether consensus has been
reached or the debate should loop for another round.

Graph Topology:
    START --> architect --> analyst --> judge --+
                ^                              |
                |  (consensus_reached==False)  |
                +------------------------------+
                         |
                   (consensus_reached==True) --> END
"""

from __future__ import annotations

import json
from typing import TypedDict

from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import END, START, StateGraph


# ── LLM Instance ─────────────────────────────────────────────────────
# Low temperature for deterministic, engineering-focused outputs
llm = ChatOllama(model="llama3", temperature=0.1)


# ── Debate State Schema ──────────────────────────────────────────────
class DebateState(TypedDict):
    """Shared mutable state that flows through every node in the graph."""

    transcript: str
    """The user's raw requirements / meeting transcript."""

    pdf_context: str
    """Combined extracted text from all uploaded PDF documents."""

    current_draft: dict
    """The latest JSON architecture draft produced by the Architect."""

    debate_history: list
    """Chronological log of arguments, critiques, and rebuttals."""

    iteration_count: int
    """Number of completed debate rounds (used to cap loops)."""

    consensus_reached: bool
    """Flag set by the Judge -- True when the debate should terminate."""


# ── System Prompts ───────────────────────────────────────────────────
ARCHITECT_SYSTEM_PROMPT = (
    "You are an expert Software Architect. Your job is to extract clear "
    "Functional Requirements and propose system components based on the "
    "user's transcript and the provided PDF context. You must output your "
    "draft strictly as a JSON object containing 'systemName' (string), "
    "'components' (list of dicts with 'id' and 'name'), and "
    "'relationships' (list of dicts with 'source', 'target', and "
    "'description'). Do not include any markdown formatting or outside text."
)

ANALYST_SYSTEM_PROMPT = (
    "You are an adversarial Security & Systems Analyst. Your job is to "
    "ruthlessly critique the Architect's draft. Compare their draft to "
    "the provided PDF context. Identify missing Non-Functional Requirements "
    "(NFRs) such as security, scalability, performance, and compliance. "
    "Provide a concise, bulleted critique. If the architecture looks "
    "perfect and covers all constraints, reply ONLY with 'APPROVED'."
)


# ── Node: Architect ──────────────────────────────────────────────────
def architect_node(state: DebateState) -> dict:
    """
    The Architect reads the transcript + PDF context and proposes (or
    refines) a system architecture draft using Llama 3.
    """
    iteration = state["iteration_count"] + 1

    # Build the human message with all available context
    history_text = ""
    if state["debate_history"]:
        history_text = (
            "\n\n--- PREVIOUS DEBATE HISTORY ---\n"
            + "\n".join(state["debate_history"])
            + "\n--- END HISTORY ---\n"
            "Use the critique above to IMPROVE your architecture draft."
        )

    human_content = (
        f"=== USER TRANSCRIPT ===\n{state['transcript']}\n\n"
        f"=== PDF CONTEXT ===\n{state['pdf_context'][:8000]}\n\n"
        f"{history_text}\n\n"
        f"Based on the above, produce your architecture JSON now."
    )

    messages = [
        SystemMessage(content=ARCHITECT_SYSTEM_PROMPT),
        HumanMessage(content=human_content),
    ]

    print(f"[ARCHITECT] Round {iteration}: Invoking Llama 3...")

    try:
        response = llm.invoke(messages)
        raw_text = response.content.strip()

        # Attempt to extract JSON from the response
        # Handle cases where the LLM wraps JSON in markdown code fences
        json_text = raw_text
        if "```" in json_text:
            # Strip markdown code fences
            parts = json_text.split("```")
            for part in parts:
                stripped = part.strip()
                if stripped.startswith("json"):
                    stripped = stripped[4:].strip()
                if stripped.startswith("{"):
                    json_text = stripped
                    break

        draft = json.loads(json_text)

        # Validate expected keys exist
        if "systemName" not in draft:
            draft["systemName"] = "G-MAD Generated Architecture"
        if "components" not in draft:
            draft["components"] = []
        if "relationships" not in draft:
            draft["relationships"] = []

        print(
            f"[ARCHITECT] Round {iteration}: "
            f"Drafted {len(draft.get('components', []))} components, "
            f"{len(draft.get('relationships', []))} relationships"
        )

    except json.JSONDecodeError as exc:
        print(
            f"[ARCHITECT] Round {iteration}: "
            f"JSON parse failed ({exc}), using fallback draft"
        )
        draft = {
            "systemName": "G-MAD Architecture (Parse Error Fallback)",
            "components": [
                {"id": "error", "name": "LLM returned non-JSON response"},
            ],
            "relationships": [],
            "_raw_response": raw_text[:2000],
        }

    except Exception as exc:
        print(
            f"[ARCHITECT] Round {iteration}: "
            f"LLM call failed ({exc}), using error draft"
        )
        draft = {
            "systemName": "G-MAD Architecture (LLM Error)",
            "components": [],
            "relationships": [],
            "_error": str(exc),
        }

    return {
        "current_draft": draft,
        "iteration_count": iteration,
    }


# ── Node: Analyst ────────────────────────────────────────────────────
def analyst_node(state: DebateState) -> dict:
    """
    The Analyst reviews the Architect's draft and critiques it for
    missing non-functional requirements, security gaps, and edge cases
    using Llama 3.
    """
    iteration = state["iteration_count"]
    history = list(state["debate_history"])  # shallow copy

    draft_str = json.dumps(state["current_draft"], indent=2)

    human_content = (
        f"=== ARCHITECT'S DRAFT (Round {iteration}) ===\n"
        f"{draft_str}\n\n"
        f"=== PDF CONTEXT ===\n{state['pdf_context'][:8000]}\n\n"
        f"Critique the above draft. Identify missing NFRs, security gaps, "
        f"scalability concerns, and edge cases. If perfect, reply APPROVED."
    )

    messages = [
        SystemMessage(content=ANALYST_SYSTEM_PROMPT),
        HumanMessage(content=human_content),
    ]

    print(f"[ANALYST]   Round {iteration}: Invoking Llama 3...")

    try:
        response = llm.invoke(messages)
        critique = response.content.strip()
        print(f"[ANALYST]   Round {iteration}: Critique submitted "
              f"({len(critique)} chars)")
    except Exception as exc:
        critique = (
            f"[Round {iteration}] ANALYST ERROR: LLM call failed -- {exc}. "
            f"Defaulting to non-approval so the debate continues."
        )
        print(f"[ANALYST]   Round {iteration}: LLM call failed ({exc})")

    history.append(f"[Round {iteration}] ANALYST: {critique}")

    return {
        "debate_history": history,
    }


# ── Node: Judge ──────────────────────────────────────────────────────
def judge_node(state: DebateState) -> dict:
    """
    The Judge evaluates whether the debate has converged by inspecting
    the Analyst's latest critique.

    Consensus is reached when:
      1. The Analyst replies with "APPROVED" (case-insensitive), OR
      2. The debate has run for >= 3 rounds (safety cap)
    """
    iteration = state["iteration_count"]

    # Check the Analyst's latest response
    last_critique = state["debate_history"][-1] if state["debate_history"] else ""
    analyst_approved = "APPROVED" in last_critique.upper()
    max_rounds_hit = iteration >= 3

    reached = analyst_approved or max_rounds_hit

    if analyst_approved:
        print(
            f"[JUDGE]     Round {iteration}: "
            f"Analyst APPROVED -- consensus reached"
        )
    elif max_rounds_hit:
        print(
            f"[JUDGE]     Round {iteration}: "
            f"Max rounds reached -- forcing consensus"
        )
    else:
        print(
            f"[JUDGE]     Round {iteration}: "
            f"No consensus -- sending back for revision"
        )

    return {
        "consensus_reached": reached,
    }


# ── Conditional Router ───────────────────────────────────────────────
def should_continue(state: DebateState) -> str:
    """Route from Judge: loop back to Architect or terminate."""
    if state["consensus_reached"]:
        return "end"
    return "architect"


# ── Graph Assembly ───────────────────────────────────────────────────
def build_graph() -> StateGraph:
    """Construct and return the compiled G-MAD debate graph."""

    workflow = StateGraph(DebateState)

    # Register nodes
    workflow.add_node("architect", architect_node)
    workflow.add_node("analyst", analyst_node)
    workflow.add_node("judge", judge_node)

    # Linear edges
    workflow.add_edge(START, "architect")
    workflow.add_edge("architect", "analyst")
    workflow.add_edge("analyst", "judge")

    # Conditional loop
    workflow.add_conditional_edges(
        "judge",
        should_continue,
        {
            "architect": "architect",   # loop back
            "end": END,                 # terminate
        },
    )

    return workflow.compile()


# ── Compiled Graph Instance ──────────────────────────────────────────
gmad_app = build_graph()
