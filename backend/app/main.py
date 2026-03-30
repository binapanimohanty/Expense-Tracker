from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth_router, transaction_router, analytics_router, report_router
from app.routers.user_router import router as user_router

app = FastAPI(title="Expense Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(user_router)
app.include_router(transaction_router.router)
app.include_router(analytics_router.router)
app.include_router(report_router.router)


@app.get("/")
def root():
    return {"message": "Expense Tracker API is running"}
