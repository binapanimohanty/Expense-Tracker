from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models.user import User
from app.services.transaction_service import get_monthly_summary, get_category_summary

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/monthly-summary")
def monthly_summary(
    year: int = Query(..., ge=2000, le=2100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_monthly_summary(db, current_user.id, year)


@router.get("/category-summary")
def category_summary(
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2000, le=2100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_category_summary(db, current_user.id, month, year)
