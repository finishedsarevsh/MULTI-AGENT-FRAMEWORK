"""
G-MAD Backend — FastAPI Ingestion Server
=========================================
Accepts multipart/form-data payloads from the React frontend:
  - transcript (str):  Unstructured requirements / meeting transcript
  - files (List[UploadFile]):  Optional PDF context documents

Saves uploaded files to ./data/ and returns a mock G-MAD architecture
payload until the AI debate pipeline is wired in.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import List

import aiofiles
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware

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
    2. Returns a mock G-MAD architecture payload (to be replaced with AI pipeline)
    """

    saved_files: list[str] = []

    # ── Save uploaded files ──
    for upload in context_files:
        if upload.filename:
            dest = DATA_DIR / upload.filename
            async with aiofiles.open(dest, "wb") as f:
                content = await upload.read()
                await f.write(content)
            saved_files.append(upload.filename)

    # ── Log receipt ──
    print(f"[G-MAD] Received transcript ({len(transcript)} chars)")
    print(f"[G-MAD] Saved {len(saved_files)} file(s): {saved_files}")

    # ── Mock Response (replace with AI debate pipeline) ──
    mock_architecture = {
        "systemName": "Generated Architecture",
        "components": [
            {"id": "clientUI", "name": "React Frontend Dashboard"},
            {"id": "apiGateway", "name": "FastAPI Gateway"},
            {"id": "debateEngine", "name": "Multi-Agent Debate Engine"},
            {"id": "vectorDB", "name": "ChromaDB Vector Store"},
            {"id": "llmService", "name": "Llama 3 LLM Service"},
        ],
        "relationships": [
            {
                "source": "clientUI",
                "target": "apiGateway",
                "description": "Sends requirements transcript",
            },
            {
                "source": "apiGateway",
                "target": "debateEngine",
                "description": "Triggers multi-agent debate",
            },
            {
                "source": "debateEngine",
                "target": "llmService",
                "description": "Queries LLM for agent responses",
            },
            {
                "source": "debateEngine",
                "target": "vectorDB",
                "description": "Retrieves grounding context (RAG)",
            },
        ],
    }

    return {
        "status": "success",
        "transcript_length": len(transcript),
        "files_saved": saved_files,
        "architecture": mock_architecture,
    }
