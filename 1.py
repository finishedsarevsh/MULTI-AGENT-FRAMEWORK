import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings

DATA_PATH = "./data"
CHROMA_PATH = "./chroma_db"

def initialize_knowledge_base():
    print("--- Loading Documents ---")
    all_docs = []
    
    # Manloop through the /data folder to find Pually DFs
    for file in os.listdir(DATA_PATH):
        if file.endswith(".pdf"):
            print(f"Indexing: {file}")
            loader = PyPDFLoader(os.path.join(DATA_PATH, file))
            all_docs.extend(loader.load())

    if not all_docs:
        print("Error: No documents found. Ensure your PDF is in the /data folder.")
        return

    # Chunking: Preparing data for the Deep Learning model
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
    chunks = text_splitter.split_documents(all_docs)
    print(f"Created {len(chunks)} knowledge chunks.")

    # Using the nomic-embed-text model for RAG grounding
    embeddings = OllamaEmbeddings(model="nomic-embed-text")
    
    # Building the Vector Database
    vector_db = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_PATH
    )
    
    print(f"--- Knowledge Base Saved to {CHROMA_PATH} ---")

if __name__ == "__main__":
    if not os.path.exists(DATA_PATH):
        os.makedirs(DATA_PATH)
        print(f"Created {DATA_PATH} folder. Please add your PDF and run again.")
    else:
        initialize_knowledge_base()