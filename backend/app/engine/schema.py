from pydantic import BaseModel, Field
from typing import List, Literal
from datetime import datetime

class ReasonCode(BaseModel):
    code: str
    description: str
    severity: Literal["low", "medium", "high", "critical"]

class Evidence(BaseModel):
    source_type: Literal["image", "text", "metadata"]
    extracted_data: dict
    hash: str

class Verdict(BaseModel):
    id: str
    status: Literal["STOP", "WAIT", "MATCH", "UNCERTAIN"]
    confidence: float
    reason_codes: List[ReasonCode]
    evidence: List[Evidence]
    recommended_action: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)