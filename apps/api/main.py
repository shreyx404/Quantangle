# =============================================================================
# Quantangle Cloud API — FastAPI Backend
# =============================================================================
# Handles:
# - Cloud quantum simulation (>16 qubits, noisy circuits via Qiskit Aer)
# - Qu-Copilot AI tutor with Verified Circuit Generation
# - Arena grading, leaderboards, and credential signing
# =============================================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Quantangle Cloud API",
    description="AI-guided Quantum Computing Learning & Multi-Engine Simulation Platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ---------------------------------------------------------------------------
# CORS — Allow the Next.js frontend to communicate with the API
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Health Check
# ---------------------------------------------------------------------------
@app.get("/api/v1/health", tags=["System"])
async def health_check():
    """Health check endpoint for monitoring and load balancer probes."""
    return {
        "status": "healthy",
        "service": "quantangle-api",
        "version": "1.0.0",
    }


# ---------------------------------------------------------------------------
# Router Registration
# ---------------------------------------------------------------------------
from routers import arena, credentials

app.include_router(arena.router, prefix="/api/v1")
app.include_router(credentials.router, prefix="/api/v1")
