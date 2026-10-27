import os
import asyncio
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

# Configure Groq
groq_client = AsyncOpenAI(
    api_key=os.getenv("GROQ_API_KEY") or "missing",
    base_url="https://api.groq.com/openai/v1",
    timeout=10.0 
)

async def _try_groq(system_prompt, user_prompt):
    response = await groq_client.chat.completions.create(
        model="openai/gpt-oss-120b", 
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        timeout=10.0
    )
    return response.choices[0].message.content

async def generate_ai_response(system_prompt: str, user_prompt: str) -> str:
    try:
        return await asyncio.wait_for(_try_groq(system_prompt, user_prompt), timeout=10.0)
    except Exception as e:
        print(f"⚠️ Groq failed: {e}")
        return "I am currently offline. Please follow the recommended actions in the verdict above."