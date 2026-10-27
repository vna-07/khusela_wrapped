# Khusela

WhatsApp + web cyber-protection toolkit for South African SMMEs.
HackSecure 2026, Track 3: SMME Cyber Protection.

> Prototype uses synthetic data only. Legal and POPIA claims are provisional design positions.

## Layout
- `backend/`  FastAPI, deterministic engine (`engine/`), assistant (`assistant/`), WhatsApp adapter
- `frontend/` React dashboard (deploy to Vercel)
- `data/`     synthetic, training and evaluation data
- `docs/`     architecture, threat model, privacy, schema, evaluation, pitch
- `demo/`     runbook, offline mode, backup video

## Rules of the codebase
1. `engine/` NEVER imports `assistant/` or `llm/`. Rules decide; AI only explains.
2. AI output can raise a verdict (OK -> WAIT -> STOP), never lower or approve one.
3. Everything a user forwards is untrusted data, never instructions.
4. Khusela never says "PAID". Best outcome: details match, confirm in your bank app.

## Quick start
```bash
cp .env.example .env
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Frontend: inside `frontend/` run `npm create vite@latest . -- --template react-ts`, then `npm install && npm run dev`.
