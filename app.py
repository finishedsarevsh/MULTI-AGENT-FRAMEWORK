import streamlit as st

from grounded_debate import call_agent, get_grounding_facts, get_intent

st.set_page_config(page_title="G-MAD: Intent-Aware", page_icon="🤖", layout="wide")
st.title("🤖 G-MAD: Generalized Multi-Agent Debate")
st.markdown("Developed for **EDI-4 Project** | VIT Pune")

with st.sidebar:
    st.header("Debate Configuration")
    role_1 = st.text_input("First Role:", value="Expert 1")
    role_2 = st.text_input("Second Role:", value="Expert 2")

if "messages" not in st.session_state:
    st.session_state.messages = []

for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

if user_input := st.chat_input("Type your request here..."):
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.markdown(user_input)

    
    intent = get_intent(user_input)

   
    with st.chat_message("assistant", avatar="👤"):
        with st.spinner(f"{role_1} is thinking..."):
            reply = call_agent(role_1, user_input, intent)
            st.markdown(f"**{role_1}:** {reply}")
            st.session_state.messages.append({"role": "assistant", "content": f"**{role_1}:** {reply}"})

    
    with st.chat_message("assistant", avatar="🔍"):
        with st.spinner(f"{role_2} is verifying..."):
            facts = get_grounding_facts(user_input)
            
            critique = call_agent(role_2, f"Debate this: {reply}", intent, context=facts)
            st.markdown(f"**{role_2}:** {critique}")
            st.session_state.messages.append({"role": "assistant", "content": f"**{role_2}:** {critique}"})