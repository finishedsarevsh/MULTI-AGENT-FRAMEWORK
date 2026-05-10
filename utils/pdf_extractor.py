"""
G-MAD PDF Text Extraction Utility
==================================
Uses PyMuPDF (fitz) to extract raw text from uploaded PDF documents.
This extracted text is fed downstream to the LangGraph multi-agent
debate engine for requirements analysis.
"""

from __future__ import annotations

import fitz  # PyMuPDF


def extract_text_from_pdf(file_path: str) -> str:
    """
    Open a PDF at *file_path*, iterate through every page,
    and return the concatenated plain-text content.

    Parameters
    ----------
    file_path : str
        Absolute or relative path to the PDF file.

    Returns
    -------
    str
        The full extracted text, or an empty string if the file
        is corrupted / unreadable.
    """
    try:
        doc = fitz.open(file_path)
    except Exception as exc:
        print(f"[PDF-EXTRACT] [FAIL] Failed to open '{file_path}': {exc}")
        return ""

    pages_text: list[str] = []

    try:
        for page_num, page in enumerate(doc, start=1):
            try:
                text = page.get_text("text")
                if text:
                    pages_text.append(text)
            except Exception as exc:
                print(
                    f"[PDF-EXTRACT] [WARN] Skipping page {page_num} "
                    f"of '{file_path}': {exc}"
                )
    finally:
        doc.close()

    full_text = "\n".join(pages_text)

    if not full_text.strip():
        print(f"[PDF-EXTRACT] [WARN] No extractable text found in '{file_path}'")
        return ""

    print(
        f"[PDF-EXTRACT] [OK] Extracted {len(full_text):,} chars "
        f"from {len(pages_text)} page(s) of '{file_path}'"
    )
    return full_text
