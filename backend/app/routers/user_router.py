from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import User
from app.schemas.user import PasswordUpdate, UserResponse, UserUpdate
from app.services.user_service import (
    get_user_profile,
    update_user_password,
    update_user_profile,
)

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def read_profile(current_user: User = Depends(get_current_user)):
    return get_user_profile(current_user)


@router.put("/me", response_model=UserResponse)
def edit_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_user_profile(db, current_user, payload)


@router.put("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    update_user_password(db, current_user, payload)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
