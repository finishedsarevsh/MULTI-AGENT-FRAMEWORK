"""
G-MAD Backend — FastAPI Ingestion Server
=========================================
Accepts multipart/form-data payloads from the React frontend:
  - transcript (str):  Unstructured requirements / meeting transcript
  - files (List[UploadFile]):  Optional PDF context documents

Saves uploaded files to ./data/, extracts PDF text, and invokes the
LangGraph multi-agent debate engine to produce an AI-generated
architecture payload.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import List

import aiofiles
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from engine.graph import gmad_app
from utils.pdf_extractor import extract_text_from_pdf

# ── App Init ──────────────────────────────────────────────────────────
app = FastAPI(
    title="G-MAD API",
    description="Grounded Multi-Agent Debate backend",
    version="0.1.0",
)

# ── CORS ──────────────────────────────────────────────────────────────
# Allow the Vite dev server (and any origin during development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── File Storage ──────────────────────────────────────────────────────
DATA_DIR = Path(__file__).parent / "data"


@app.on_event("startup")
async def ensure_data_dir():
    """Create the data/ directory on startup if it doesn't exist."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)


# ── Health Check ──────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"status": "ok", "service": "G-MAD API", "version": "0.1.0"}


# ── Ingestion Endpoint ────────────────────────────────────────────────
@app.post("/api/debate")
async def run_debate(
    transcript: str = Form(...),
    context_files: List[UploadFile] = File(default=[]),
):
    """
    Accepts the user's requirements transcript and optional PDF context files.

    1. Saves each uploaded file to ./data/
    2. Extracts text from PDFs via PyMuPDF
    3. Invokes the LangGraph multi-agent debate engine
    4. Returns the AI-generated architecture payload
    """

    saved_files: list[str] = []
    extracted_texts: list[dict[str, str]] = []

    # ── Save uploaded files & extract text ──
    for upload in context_files:
        if upload.filename:
            dest = DATA_DIR / upload.filename
            async with aiofiles.open(dest, "wb") as f:
                content = await upload.read()
                await f.write(content)
            saved_files.append(upload.filename)

            # ── PDF Text Extraction ──
            if upload.filename.lower().endswith(".pdf"):
                text = extract_text_from_pdf(str(dest))
                extracted_texts.append(
                    {"filename": upload.filename, "text": text}
                )
                # Verification: print first 500 chars to terminal
                preview = text[:500] if text else "<no text extracted>"
                print(
                    f"[G-MAD] PDF Preview ({upload.filename}):\n"
                    f"{preview}\n{'─' * 60}"
                )

    # ── Log receipt ──
    print(f"[G-MAD] Received transcript ({len(transcript)} chars)")
    print(f"[G-MAD] Saved {len(saved_files)} file(s): {saved_files}")
    print(f"[G-MAD] Extracted text from {len(extracted_texts)} PDF(s)")

    # ── Combine extracted PDF texts ──
    combined_pdf_text = "\n".join(
        entry["text"] for entry in extracted_texts if entry["text"]
    )

    # ── Invoke LangGraph Debate Engine ──
    print(f"[G-MAD] Invoking debate engine...")
    initial_state = {
        "transcript": transcript,
        "pdf_context": combined_pdf_text,
        "current_draft": {},
        "debate_history": [],
        "iteration_count": 0,
        "consensus_reached": False,
    }

    final_state = gmad_app.invoke(initial_state)

    print(
        f"[G-MAD] Debate complete: "
        f"{final_state['iteration_count']} round(s), "
        f"consensus={'YES' if final_state['consensus_reached'] else 'NO'}"
    )

    # ── Return AI-generated payload ──
    return {
        "status": "success",
        "transcript_length": len(transcript),
        "files_saved": saved_files,
        "pdf_extractions": len(extracted_texts),
        "debate_rounds": final_state["iteration_count"],
        "consensus_reached": final_state["consensus_reached"],
        "debate_history": final_state["debate_history"],
        "architecture": final_state["current_draft"],
    }
