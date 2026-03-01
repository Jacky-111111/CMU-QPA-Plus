from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import json
import os
import re
from urllib import error as url_error
from urllib import request as url_request

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


def normalize_course_id(course_id: str) -> str:
    """
    Normalize a course id into CMU dd-ddd form.
    Accepts:
      - 15122
      - 15-122
      - 15 122
    """
    trimmed = course_id.strip()
    if re.fullmatch(r"\d{5}", trimmed):
        return f"{trimmed[:2]}-{trimmed[2:]}"

    match = re.fullmatch(r"(\d{2})[-\s]?(\d{3})", trimmed)
    if match:
        return f"{match.group(1)}-{match.group(2)}"

    raise ValueError("Invalid course id format")


@app.get("/course-units/{course_id}")
def get_course_units(course_id: str):
    """
    Proxy to ScottyLabs Course API v2.
    Using backend proxy avoids browser CORS issues.
    """
    try:
        normalized = normalize_course_id(course_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    api_url = f"https://api.cmucourses.com/v2/courses/{normalized}"

    try:
        req = url_request.Request(
            api_url,
            headers={"Accept": "application/json", "User-Agent": "CMU-QPA-Plus/1.0"},
        )
        with url_request.urlopen(req, timeout=10) as response:
            status_code = response.getcode()
            payload = response.read().decode("utf-8")
    except url_error.HTTPError as exc:
        if exc.code == 404:
            raise HTTPException(status_code=404, detail="Course not found")
        raise HTTPException(status_code=502, detail=f"Upstream HTTP error: {exc.code}")
    except url_error.URLError as exc:
        raise HTTPException(status_code=502, detail=f"Upstream network error: {exc.reason}")

    if status_code != 200:
        raise HTTPException(status_code=502, detail=f"Upstream status: {status_code}")

    try:
        data = json.loads(payload)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="Invalid upstream JSON")

    if not isinstance(data, list) or len(data) == 0:
        raise HTTPException(status_code=404, detail="Course not found")

    first = data[0]
    units = first.get("units") if isinstance(first, dict) else None
    if not isinstance(units, (int, float)):
        raise HTTPException(status_code=404, detail="Course units not available")

    return JSONResponse(content={"courseId": normalized, "units": units})


# Serve static webpage (must be last so API routes are matched first)
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")