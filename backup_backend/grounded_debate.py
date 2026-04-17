import ollama
from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings 

embeddings = OllamaEmbeddings(model="nomic-embed-text")
vector_db = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)

def get_intent(user_query):
    """Detects if the user wants Creative, Technical, or Informational content."""
    prompt = f"Categorize the intent of this request: '{user_query}'. Reply with only ONE word: 'Technical', 'Creative', or 'Informational'."
    response = ollama.chat(model='llama3', messages=[{'role': 'user', 'content': prompt}])
    return response['message']['content'].strip()

def get_grounding_facts(query):
    """Retrieves evidence from your local 2025 IEEE research papers[cite: 1, 35]."""
    try:
        docs = vector_db.similarity_search(query, k=2)
        return "\n".join([d.page_content for d in docs])
    except Exception:
        return ""

def call_agent(role, prompt, intent, context=""):
    """Persona adapts based on Intent to ensure true User Understanding."""
    
    if "Creative" in intent:
        style = "Be imaginative and conversational. DO NOT suggest software features or apps."
    elif "Technical" in intent:
        style = "Be a rigorous engineer. Focus on architecture, MAD taxonomies, and RE standards[cite: 28, 92]."
    else:
        style = "Be a direct assistant. Provide clear, factual information."

    system_instr = (
        f"You are a {role}. {style} "
        f"Use this research data if it is relevant to the topic: {context}"
    )
    
    response = ollama.chat(model='llama3', messages=[
        {'role': 'system', 'content': system_instr},
        {'role': 'user', 'content': prompt},
    ])
    return response['message']['content']