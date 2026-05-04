import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OllamaEmbeddings
from langchain_chroma import Chroma

# --- Configuration ---
PDF_PATH = "data/IEEE-2025-security-patterns.pdf"
CHROMA_PATH = "chroma_db"
EMBEDDING_MODEL = "nomic-embed-text" 

def ingest_document():
    print(f"[*] Loading document: {PDF_PATH}")
    if not os.path.exists(PDF_PATH):
        print(f"[!] Error: Could not find {PDF_PATH}. Please place your PDF in the data/ folder.")
        return

    # 1. Load the PDF
    loader = PyPDFLoader(PDF_PATH)
    documents = loader.load()

    # 2. Chunk the text (1000 characters per chunk, 200 character overlap for context)
    print("[*] Splitting text into readable chunks...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    chunks = text_splitter.split_documents(documents)
    print(f"[*] Sliced PDF into {len(chunks)} distinct chunks.")

    # 3. Initialize the local embedding model
    print(f"[*] Initializing local embedding model: {EMBEDDING_MODEL}...")
    embeddings = OllamaEmbeddings(model=EMBEDDING_MODEL)

    # 4. Create the Vector Database
    print(f"[*] Generating embeddings and saving to ./{CHROMA_PATH}...")
    db = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_PATH
    )
    
    print("[SUCCESS] RAG Vault is populated and ready for the agents!")

if __name__ == "__main__":
    ingest_document()
