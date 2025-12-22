from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os
from typing import Optional

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

# Course Info API
@app.get("/course-info/{course_code}")
def get_course_info(course_code: str):
    """
    Get course information including units from CMU Course API.
    Course code should be in format like '76101' or '76-101'.
    """
    try:
        import cmu_course_api
        
        # Normalize course code: remove hyphens and ensure 5 digits
        normalized_code = course_code.replace('-', '').strip()
        
        # Validate format: should be 5 digits
        if not normalized_code.isdigit() or len(normalized_code) != 5:
            raise HTTPException(status_code=400, detail="Course code must be 5 digits (e.g., '76101' or '76-101')")
        
        # Format as XX-XXX for API lookup
        formatted_code = f"{normalized_code[:2]}-{normalized_code[2:]}"
        
        # Try to get course data from recent semesters
        # Common semester codes: F (Fall), S (Spring), M1 (Mini 1), M2 (Mini 2)
        # Try current year semesters first (most likely to have data)
        import datetime
        current_year = datetime.datetime.now().year
        current_month = datetime.datetime.now().month
        
        # Determine likely current semester
        if current_month >= 1 and current_month <= 5:
            # Spring semester
            semesters = ['S', 'F', 'M1', 'M2']
        elif current_month >= 8 and current_month <= 12:
            # Fall semester
            semesters = ['F', 'S', 'M1', 'M2']
        else:
            # Summer/Mini
            semesters = ['M1', 'M2', 'S', 'F']
        
        course_info = None
        last_error = None
        
        for semester in semesters:
            try:
                data = cmu_course_api.get_course_data(semester)
                if data and 'courses' in data and formatted_code in data['courses']:
                    course_info = data['courses'][formatted_code]
                    break
            except Exception as e:
                # If semester doesn't exist or API fails, try next semester
                last_error = str(e)
                continue
        
        if not course_info:
            error_msg = f"Course {formatted_code} not found in any available semester"
            if last_error:
                error_msg += f" (last error: {last_error})"
            raise HTTPException(status_code=404, detail=error_msg)
        
        # Extract units (may be None for variable units courses)
        units = course_info.get('units')
        
        # Convert units to float if it's a number
        if units is not None:
            try:
                units = float(units)
            except (ValueError, TypeError):
                units = None
        
        return JSONResponse(content={
            "course_code": formatted_code,
            "normalized_code": normalized_code,
            "name": course_info.get('name', ''),
            "units": units,
            "department": course_info.get('department', '')
        })
        
    except HTTPException:
        raise
    except ImportError:
        raise HTTPException(status_code=500, detail="CMU Course API not available. Please install cmu-course-api.")
    except Exception as e:
        import traceback
        error_detail = f"Error fetching course info: {str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)