from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.auth import hash_password, verify_password
from app.models import User
from app.schemas.user import PasswordUpdate, UserResponse, UserUpdate


def get_user_profile(current_user: User) -> UserResponse:
    return UserResponse.model_validate(current_user)



def update_user_profile(db: Session, current_user: User, payload: UserUpdate) -> UserResponse:
    existing = (
        db.query(User)
        .filter(User.email == payload.email, User.id != current_user.id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    current_user.name = payload.name.strip()
    current_user.email = payload.email.strip().lower()
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)



def update_user_password(db: Session, current_user: User, payload: PasswordUpdate) -> None:
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    if len(payload.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters",
        )

    if verify_password(payload.new_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from the current password",
        )

    current_user.password_hash = hash_password(payload.new_password)
    db.commit()
