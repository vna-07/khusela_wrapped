import os
import asyncio
import google.generativeai as genai
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini (Stable SDK)
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Configure DeepSeek
deepseek_client = AsyncOpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY") or "missing",
    base_url="https://api.deepseek.com",
    timeout=5.0 
)

async def _try_gemini(prompt):
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    response = await model.generate_content_async(
        prompt, 
        request_options={"timeout": 5.0}
    )
    return response.text

async def _try_deepseek(system_prompt, user_prompt):
    response = await deepseek_client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        timeout=5.0
    )
    return response.choices[0].message.content

async def generate_ai_response(system_prompt: str, user_prompt: str) -> str:
    combined_prompt = f"System: {system_prompt}\n\nUser: {user_prompt}"
    
    try:
        return await asyncio.wait_for(_try_gemini(combined_prompt), timeout=5.0)
    except Exception as e:
        print(f"⚠️ Gemini failed: {e}")

    try:
        return await asyncio.wait_for(_try_deepseek(system_prompt, user_prompt), timeout=5.0)
    except Exception as e:
        print(f"⚠️ DeepSeek failed: {e}")

    print("🚨 Both AI providers failed. Using fallback.")
    return "I am currently offline. Please follow the recommended actions in the verdict above."