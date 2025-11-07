# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import os

from model import QpaRequest
from qpa_engine import calculateQPA

app = FastAPI(
    title="CMU QPA Plus API",
    version="1.0.0",
    description="Not an official CMU tool. Local data calculation only.",
)

# ✅ 允许跨域访问（CORS）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 之后可改成具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 提供静态文件（比如 style.css）
app.mount("/static", StaticFiles(directory="."), name="static")

# ✅ 首页（index.html）
@app.get("/", response_class=HTMLResponse)
def read_root():
    index_path = os.path.join(os.path.dirname(__file__), "index.html")
    with open(index_path, "r", encoding="utf-8") as f:
        return f.read()

# ✅ 健康检查
@app.get("/healthz")
def health_check():
    return {"status": "ok"}

# ✅ QPA 计算 API
@app.post("/calculate-qpa")
def calculate_qpa(req: QpaRequest):
    if not req.grades:
        raise HTTPException(status_code=400, detail="grades list cannot be empty")
    result = calculateQPA(req.grades)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5001)

    