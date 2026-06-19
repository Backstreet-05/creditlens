import logging

from fastapi import APIRouter, HTTPException, Request

from app.core.limiter import limiter
from app.schemas.applicant import ApplicantInput
from app.schemas.prediction import PredictionResponse

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
@limiter.limit("30/minute")
async def predict(request: Request, body: ApplicantInput):
    predictor = getattr(request.app.state, "predictor", None)
    if not predictor or not predictor.loaded:
        raise HTTPException(
            status_code=503,
            detail="Model not available. Artifacts are generated in Milestone 2.",
        )
    try:
        return predictor.predict(body)
    except Exception as exc:
        logger.exception("Prediction failed: %s", exc)
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again.") from exc
