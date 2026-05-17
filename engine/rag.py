"""
G-MAD RAG Pipeline
==================
Retrieval-Augmented Generation utilities for the G-MAD multi-agent
debate engine.  Provides two public functions:

  • ``ingest_pdf``       – Extract, chunk, embed, and store a PDF in
                           a local ChromaDB collection.
  • ``retrieve_context`` – Semantic-search the collection and return
                           the top-k most relevant chunks as a single
                           concatenated string.

Both functions share the same embedding model (Ollama nomic-embed-text)
and persistent ChromaDB path so that ingested documents are immediately
queryable across server restarts.
"""

from __future__ import annotations

import os
from typing import Optional

import chromadb
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings


# ── Defaults ─────────────────────────────────────────────────────────
_CHROMA_PATH = os.path.join(os.path.dirname(__file__), "..", "chroma_db")
_EMBED_MODEL = "nomic-embed-text"
_DEFAULT_COLLECTION = "gmad_docs"
_CHUNK_SIZE = 1000
_CHUNK_OVERLAP = 200


# ── Shared Instances ─────────────────────────────────────────────────
def _get_chroma_client() -> chromadb.PersistentClient:
    """Return a persistent ChromaDB client rooted at ``./chroma_db``."""
    return chromadb.PersistentClient(path=os.path.abspath(_CHROMA_PATH))


def _get_embeddings() -> OllamaEmbeddings:
    """Return the Ollama embedding model used for both ingest & query."""
    return OllamaEmbeddings(model=_EMBED_MODEL)


# ── PDF Ingestion ────────────────────────────────────────────────────
def ingest_pdf(
    file_path: str,
    collection_name: str = _DEFAULT_COLLECTION,
) -> int:
    """
    Extract text from a PDF, split it into chunks, embed each chunk
    with ``nomic-embed-text``, and upsert them into a ChromaDB
    collection.

    Parameters
    ----------
    file_path : str
        Absolute or relative path to the PDF file.
    collection_name : str
        Name of the ChromaDB collection to store chunks in.

    Returns
    -------
    int
        Number of chunks successfully ingested.

    Raises
    ------
    FileNotFoundError
        If *file_path* does not exist.
    """
    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"PDF not found: {file_path}")

    print(f"[RAG] Ingesting: {os.path.basename(file_path)}")

    # 1. Load PDF pages
    loader = PyPDFLoader(file_path)
    pages = loader.load()
    print(f"[RAG]   → {len(pages)} page(s) extracted")

    # 2. Split into chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=_CHUNK_SIZE,
        chunk_overlap=_CHUNK_OVERLAP,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = splitter.split_documents(pages)
    print(f"[RAG]   → {len(chunks)} chunk(s) after splitting")

    if not chunks:
        print("[RAG]   ⚠ No text extracted — skipping embedding")
        return 0

    # 3. Embed chunks
    embeddings = _get_embeddings()
    texts = [chunk.page_content for chunk in chunks]
    vectors = embeddings.embed_documents(texts)

    # 4. Upsert into ChromaDB
    client = _get_chroma_client()
    collection = client.get_or_create_collection(name=collection_name)

    # Build unique IDs from filename + chunk index
    base_name = os.path.splitext(os.path.basename(file_path))[0]
    ids = [f"{base_name}_chunk_{i}" for i in range(len(chunks))]

    # Build metadata for each chunk
    metadatas = [
        {
            "source": os.path.basename(file_path),
            "page": chunk.metadata.get("page", 0),
            "chunk_index": i,
        }
        for i, chunk in enumerate(chunks)
    ]

    collection.upsert(
        ids=ids,
        documents=texts,
        embeddings=vectors,
        metadatas=metadatas,
    )

    print(f"[RAG]   ✓ {len(chunks)} chunks stored in '{collection_name}'")
    return len(chunks)


# ── Context Retrieval ────────────────────────────────────────────────
def retrieve_context(
    query: str,
    collection_name: str = _DEFAULT_COLLECTION,
    top_k: int = 3,
) -> str:
    """
    Semantic-search the ChromaDB collection and return the most
    relevant chunks concatenated into a single string.

    Parameters
    ----------
    query : str
        The search query (e.g. the user transcript or Architect prompt).
    collection_name : str
        Name of the ChromaDB collection to search.
    top_k : int
        Number of top results to return.

    Returns
    -------
    str
        Concatenated text of the top-k matching chunks, separated by
        section dividers.  Returns an empty string if the collection
        does not exist or contains no documents.
    """
    client = _get_chroma_client()

    # Guard: collection may not exist yet
    existing = [c.name for c in client.list_collections()]
    if collection_name not in existing:
        print(f"[RAG] Collection '{collection_name}' not found — skipping retrieval")
        return ""

    collection = client.get_collection(name=collection_name)

    if collection.count() == 0:
        print("[RAG] Collection is empty — skipping retrieval")
        return ""

    # Embed the query with the same model used at ingest time
    embeddings = _get_embeddings()
    query_vector = embeddings.embed_query(query)

    results = collection.query(
        query_embeddings=[query_vector],
        n_results=min(top_k, collection.count()),
        include=["documents", "metadatas", "distances"],
    )

    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    if not documents:
        return ""

    # Build a readable context string
    sections = []
    for i, (doc, meta, dist) in enumerate(zip(documents, metadatas, distances)):
        source = meta.get("source", "unknown")
        page = meta.get("page", "?")
        sections.append(
            f"[Source: {source}, Page {page}, Relevance: {1 - dist:.2f}]\n{doc}"
        )

    context = "\n\n---\n\n".join(sections)

    print(
        f"[RAG] Retrieved {len(documents)} chunk(s) from '{collection_name}' "
        f"(best relevance: {1 - distances[0]:.2f})"
    )
    return context
