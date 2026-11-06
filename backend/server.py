import json
import logging
import os
import secrets
from pathlib import Path
from typing import List, Literal, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from zerog import ZeroGPrivateComputer  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("aegis")

app = FastAPI(title="AEGIS API")
api_router = APIRouter(prefix="/api")
zerog = ZeroGPrivateComputer()


class WireMessage(BaseModel):
    role: Literal["user", "agent"]
    text: str = Field(max_length=8000)


class GateEvent(BaseModel):
    outcome: Literal["approved", "auto", "blocked", "denied", "cancelled", "expired", "rejected"]
    action: dict
    proof: Optional[dict] = None
    receipt: Optional[dict] = None


class ThinkRequest(BaseModel):
    session_id: str = Field(min_length=1, max_length=80)
    messages: List[WireMessage] = Field(max_length=40)
    event: Optional[GateEvent] = None


class WorldIdProof(BaseModel):
    proof: str
    merkle_root: str
    nullifier_hash: str
    verification_level: str = "orb"
    action: str
    signal: str = ""


@api_router.get("/")
async def root():
    return {"service": "aegis", "status": "ok"}


@api_router.get("/zerog/status")
async def zerog_status():
    return zerog.status()


@api_router.post("/agent/think")
async def agent_think(body: ThinkRequest):
    messages = [m.model_dump() for m in body.messages]
    event = body.event.model_dump() if body.event else None

    async def events():
        try:
            async for ev in zerog.stream(body.session_id, messages, event):
                yield f"data: {json.dumps(ev)}\n\n"
        except Exception as exc:
            logger.exception("inference failed")
            yield f"data: {json.dumps({'type': 'error', 'message': str(exc)[:200]})}\n\n"

    return StreamingResponse(events(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@api_router.post("/worldid/verify")
async def worldid_verify(body: WorldIdProof):
    # DEMO MODE: proofs produced by the simulated IDKit flow are accepted here.
    # TO CONNECT REAL WORLD ID: forward the IDKit result to the Developer Portal
    #   POST https://developer.worldcoin.org/api/v2/verify/{WORLD_ID_APP_ID}
    #   json={proof, merkle_root, nullifier_hash, verification_level, action, signal_hash}
    # and return success only when the portal responds 200. Store used nullifiers
    # per action to guarantee each proof is fresh and single-use.
    valid = not body.proof.startswith("0xdead")
    return {
        "success": valid,
        "app_id": os.environ.get("WORLD_ID_APP_ID"),
        "action": body.action,
        "nullifier_hash": body.nullifier_hash,
        "verification_level": body.verification_level,
        "code": None if valid else "invalid_proof",
        "verified_at_block": secrets.randbelow(900000) + 7100000,
    }


app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
