import os
import asyncio
import google.generativeai as genai
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Configure Groq
groq_client = AsyncOpenAI(
    api_key=os.getenv("GROQ_API_KEY") or "missing",
    base_url="https://api.groq.com/openai/v1",
    timeout=10.0 
)

async def _try_groq(system_prompt, user_prompt):
    # Using Groq's high-speed 120B model
    response = await groq_client.chat.completions.create(
        model="openai/gpt-oss-120b", 
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        timeout=10.0
    )
    return response.choices[0].message.content

async def _try_gemini(prompt):
    model = genai.GenerativeModel('gemini-flash-latest')
    response = await model.generate_content_async(
        prompt, 
        request_options={"timeout": 10.0} # Shorter timeout
    )
    return response.text

async def generate_ai_response(system_prompt: str, user_prompt: str) -> str:
    combined_prompt = f"System: {system_prompt}\n\nUser: {user_prompt}"
    
    # 1. Try GROQ FIRST (it's much faster)
    try:
        print("🤖 Attempting Groq...")
        return await asyncio.wait_for(_try_groq(system_prompt, user_prompt), timeout=10.0)
    except Exception as e:
        print(f"⚠️ Groq failed: {e}")

    # 2. Try Gemini as backup
    try:
        print("🤖 Attempting Gemini...")
        return await asyncio.wait_for(_try_gemini(combined_prompt), timeout=10.0)
    except Exception as e:
        print(f"⚠️ Gemini failed: {e}")

    # 3. Fallback
    print("🚨 Both AI providers failed. Using fallback.")
    return "I am currently offline. However, your security is still protected by Khusela's deterministic engine. Please follow the recommended actions in the verdict above."