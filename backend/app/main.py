from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.api.routes import health, model, predict
from app.core.config import settings
from app.core.limiter import limiter
from app.services.predictor import PredictorService

predictor: PredictorService | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global predictor
    predictor = PredictorService()
    predictor.load()
    app.state.predictor = predictor
    yield
    predictor = None


app = FastAPI(
    title="Credit Risk Intelligence API",
    description="ML-powered credit risk assessment API",
    version="1.0.0",
    lifespan=lifespan,
    # Disable interactive docs outside of local development
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    openapi_url="/openapi.json" if settings.debug else None,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# CORS — restrict headers to only what the frontend needs
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next) -> Response:
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    # Remove server version banner (MutableHeaders uses del, not pop)
    if "server" in response.headers:
        del response.headers["server"]
    return response


app.include_router(health.router, tags=["Health"])
app.include_router(predict.router, tags=["Prediction"])
app.include_router(model.router, prefix="/model", tags=["Model"])
