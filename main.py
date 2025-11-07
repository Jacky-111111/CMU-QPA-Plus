# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from model import QpaRequest
from qpa_engine import calculateQPA

app = FastAPI(
    title="CMU QPA Plus API",
    version="1.0.0",
    description="Not an official CMU tool. Local data calculation only.",
)

# ✅ CORS（允许前端访问）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 可以以后改成具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 健康检查
@app.get("/healthz")
def health_check():
    return {"status": "ok"}

# ✅ QPA计算 API
@app.post("/calculate-qpa")
def calculate_qpa(req: QpaRequest):
    if not req.grades:
        raise HTTPException(status_code=400, detail="grades list cannot be empty")
    
    result = calculateQPA(req.grades)  # 直接给你的函数

    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5001)
