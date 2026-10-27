from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.engine.evaluate import evaluate_payment_proof

app = FastAPI(title="Khusela Core")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Change for production
    allow_methods=["*"],
    allow_headers=["*"],
)

class CheckRequest(BaseModel):
    text_input: str
    file_hash: str = "mock_hash_123"

@app.post("/api/v1/check/payment")
async def check_payment(req: CheckRequest):
    return evaluate_payment_proof(req.text_input, req.file_hash)

@app.get("/")
def health():
    return {"status": "Khusela Core is online. Secure the bag."}