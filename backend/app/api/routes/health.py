from fastapi import APIRouter, Request

from app.core.config import settings
from app.core.limiter import limiter

router = APIRouter()


@router.get("/health")
@limiter.limit("60/minute")
async def health(request: Request):
    predictor = getattr(request.app.state, "predictor", None)
    model_loaded = predictor.loaded if predictor else False
    return {"status": "ok", "model_loaded": model_loaded, "version": settings.model_version}
