import math
from datetime import date
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, extract
from sqlalchemy.orm import Session

from app.models import Transaction
from app.schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    PaginatedTransactions,
)


def create_transaction(db: Session, user_id: UUID, payload: TransactionCreate) -> TransactionResponse:
    txn = Transaction(user_id=user_id, **payload.model_dump())
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return TransactionResponse.model_validate(txn)


def get_transactions(
    db: Session,
    user_id: UUID,
    page: int = 1,
    page_size: int = 10,
    month: Optional[int] = None,
    year: Optional[int] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    txn_type: Optional[str] = None,
) -> PaginatedTransactions:
    query = db.query(Transaction).filter(Transaction.user_id == user_id)

    if month and year:
        query = query.filter(
            extract("month", Transaction.transaction_date) == month,
            extract("year", Transaction.transaction_date) == year,
        )
    elif year:
        query = query.filter(extract("year", Transaction.transaction_date) == year)

    if category:
        query = query.filter(Transaction.category == category.lower())

    if txn_type:
        query = query.filter(Transaction.type == txn_type.lower())

    if search:
        query = query.filter(Transaction.title.ilike(f"%{search}%"))

    total = query.count()
    total_pages = max(1, math.ceil(total / page_size))

    items = (
        query.order_by(Transaction.transaction_date.desc(), Transaction.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedTransactions(
        items=[TransactionResponse.model_validate(t) for t in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


def get_transaction_by_id(db: Session, user_id: UUID, txn_id: UUID) -> Transaction:
    txn = db.query(Transaction).filter(
        Transaction.id == txn_id, Transaction.user_id == user_id
    ).first()
    if not txn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return txn


def update_transaction(
    db: Session, user_id: UUID, txn_id: UUID, payload: TransactionUpdate
) -> TransactionResponse:
    txn = get_transaction_by_id(db, user_id, txn_id)
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(txn, key, value)
    db.commit()
    db.refresh(txn)
    return TransactionResponse.model_validate(txn)


def delete_transaction(db: Session, user_id: UUID, txn_id: UUID) -> None:
    txn = get_transaction_by_id(db, user_id, txn_id)
    db.delete(txn)
    db.commit()


def get_monthly_summary(db: Session, user_id: UUID, year: int) -> list[dict]:
    results = (
        db.query(
            extract("month", Transaction.transaction_date).label("month"),
            Transaction.type,
            func.sum(Transaction.amount).label("total"),
        )
        .filter(
            Transaction.user_id == user_id,
            extract("year", Transaction.transaction_date) == year,
        )
        .group_by("month", Transaction.type)
        .order_by("month")
        .all()
    )

    monthly: dict[int, dict] = {}
    for row in results:
        m = int(row.month)
        if m not in monthly:
            monthly[m] = {"month": m, "income": 0.0, "expense": 0.0}
        monthly[m][row.type] = round(float(row.total), 2)

    return [monthly.get(m, {"month": m, "income": 0.0, "expense": 0.0}) for m in range(1, 13)]


def get_category_summary(
    db: Session, user_id: UUID, month: Optional[int] = None, year: Optional[int] = None
) -> list[dict]:
    query = db.query(
        Transaction.category,
        Transaction.type,
        func.sum(Transaction.amount).label("total"),
    ).filter(Transaction.user_id == user_id)

    if month and year:
        query = query.filter(
            extract("month", Transaction.transaction_date) == month,
            extract("year", Transaction.transaction_date) == year,
        )
    elif year:
        query = query.filter(extract("year", Transaction.transaction_date) == year)

    results = query.group_by(Transaction.category, Transaction.type).all()
    return [
        {"category": row.category, "type": row.type, "total": round(float(row.total), 2)}
        for row in results
    ]


def get_transactions_for_export(
    db: Session,
    user_id: UUID,
    month: Optional[int] = None,
    year: Optional[int] = None,
) -> list[Transaction]:
    query = db.query(Transaction).filter(Transaction.user_id == user_id)
    if month and year:
        query = query.filter(
            extract("month", Transaction.transaction_date) == month,
            extract("year", Transaction.transaction_date) == year,
        )
    elif year:
        query = query.filter(extract("year", Transaction.transaction_date) == year)
    return query.order_by(Transaction.transaction_date.desc()).all()
