from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os

from model import QpaRequest
from qpa_engine import calculateQPA

app = FastAPI(
    title="CMU QPA Plus API",
    version="1.0.0",
    description="Unofficial CMU QPA calculator (runs online).",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static webpage
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

# Health check
@app.get("/healthz")
def health_check():
    return {"status": "ok"}

# QPA API
@app.post("/calculate-qpa")
def calculate_qpa(req: QpaRequest):
    if not req.grades:
        raise HTTPException(status_code=400, detail="Grades list cannot be empty")

    try:
        result = calculateQPA(req.grades)
        return JSONResponse(content=result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))