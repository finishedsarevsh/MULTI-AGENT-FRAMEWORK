"""
G-MAD Debate Engine -- Live Smoke Test
=======================================
Runs the full debate graph against the real PDF in data/.
Requires Ollama to be running with the llama3 model pulled.

Usage:  python test_graph.py
"""

from engine.graph import gmad_app
from utils.pdf_extractor import extract_text_from_pdf

PDF_PATH = "data/Multi-Agent_Debate_Strategies_to_Enhance_Requirements_Engineering_with_Large_Language_Models.pdf"

# Extract real PDF context
print("=" * 60)
print("  G-MAD Debate Engine -- Live Test")
print("=" * 60)
print()
print("[SETUP] Extracting PDF context...")
pdf_text = extract_text_from_pdf(PDF_PATH)
print()

initial_state = {
    "transcript": (
        "We need to build a multi-agent debate system for requirements "
        "engineering. The system should use LLMs to debate and refine "
        "software requirements extracted from meeting transcripts. It "
        "needs a React frontend, FastAPI backend, and ChromaDB for RAG."
    ),
    "pdf_context": pdf_text,
    "current_draft": {},
    "debate_history": [],
    "iteration_count": 0,
    "consensus_reached": False,
}

print("[INVOKE] Starting debate graph (this may take a few minutes)...")
print()

result = gmad_app.invoke(initial_state)

print()
print("=" * 60)
print("  FINAL RESULTS")
print("=" * 60)

iters = result["iteration_count"]
consensus = result["consensus_reached"]
draft = result["current_draft"]
history = result["debate_history"]

print(f"  Iterations:  {iters}")
print(f"  Consensus:   {consensus}")
print(f"  Components:  {len(draft.get('components', []))}")
print(f"  Relations:   {len(draft.get('relationships', []))}")
print(f"  Critiques:   {len(history)}")
print()

print("--- ARCHITECTURE DRAFT ---")
import json
print(json.dumps(draft, indent=2)[:3000])
print()

print("--- DEBATE HISTORY ---")
for i, entry in enumerate(history, 1):
    print(f"\n[Entry {i}]")
    print(entry[:1000])
print()
print("[TEST] COMPLETE")
