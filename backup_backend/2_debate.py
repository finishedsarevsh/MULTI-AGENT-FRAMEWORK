import ollama

def call_llm(role_name, prompt, conversation_history):

    system_message = f"You are a {role_name}. "
    full_prompt = system_message + "\n" + conversation_history + "\n" + prompt
    
    response = ollama.chat(model='llama3', messages=[
        {'role': 'system', 'content': system_message},
        {'role': 'user', 'content': full_prompt},
    ])
    return response['message']['content']

history = "Client wants a secure login page for a medical app.\n"

analyst_suggestion = call_llm("Business Analyst", "Suggest features for this login page.", history)
print(f"ANALYST: {analyst_suggestion}\n")

history += f"Analyst suggested: {analyst_suggestion}"
architect_critique = call_llm("Software Architect", "Critique these suggestions for security flaws.", history)
print(f"ARCHITECT: {architect_critique}")