import json
from pathlib import Path

from fastapi import APIRouter, HTTPException, Request

from app.core.limiter import limiter

router = APIRouter()

ARTIFACTS_DIR = Path(__file__).parent.parent.parent.parent / "ml" / "artifacts"


def _load_json(filename: str):
    path = ARTIFACTS_DIR / filename
    if not path.exists():
        raise HTTPException(status_code=503, detail=f"{filename} not found. Complete M2 first.")
    with open(path) as f:
        return json.load(f)


@router.get("/info")
@limiter.limit("60/minute")
async def model_info(request: Request):
    return _load_json("model_metadata.json")


@router.get("/shap-global")
@limiter.limit("60/minute")
async def shap_global(request: Request):
    return _load_json("shap_values_global.json")
