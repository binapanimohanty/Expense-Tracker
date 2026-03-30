import csv
import io
from datetime import date as date_type
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import User
from app.models.transaction import Transaction
from app.services.transaction_service import get_transactions_for_export

router = APIRouter(prefix="/api/report", tags=["Report"])

_VALID_TYPES = {"income", "expense"}
_VALID_CATEGORIES = {
    "salary", "freelance", "investment", "food", "transport",
    "entertainment", "shopping", "bills", "health", "education",
    "rent", "travel", "other",
}


@router.get("/export")
def export_csv(
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2000, le=2100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transactions = get_transactions_for_export(db, current_user.id, month, year)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Title", "Type", "Category", "Amount"])

    for txn in transactions:
        writer.writerow([
            txn.transaction_date.isoformat(),
            txn.title,
            txn.type,
            txn.category,
            txn.amount,
        ])

    output.seek(0)
    filename = "transactions"
    if year:
        filename += f"_{year}"
    if month:
        filename += f"_{month:02d}"
    filename += ".csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.post("/import")
async def import_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5 MB)")

    text = content.decode("utf-8", errors="replace")
    reader = csv.DictReader(io.StringIO(text))

    imported = 0
    errors: list[str] = []

    for i, row in enumerate(reader, start=2):
        try:
            txn_date = date_type.fromisoformat(row["Date"].strip())
            title = row["Title"].strip()
            txn_type = row["Type"].strip().lower()
            category = row["Category"].strip().lower()
            amount = float(row["Amount"])

            if not title:
                raise ValueError("Title is empty")
            if txn_type not in _VALID_TYPES:
                raise ValueError(f"Invalid type '{row['Type']}'")
            if category not in _VALID_CATEGORIES:
                raise ValueError(f"Invalid category '{row['Category']}'")
            if amount <= 0:
                raise ValueError("Amount must be positive")

            db.add(Transaction(
                user_id=current_user.id,
                title=title,
                amount=amount,
                type=txn_type,
                category=category,
                transaction_date=txn_date,
            ))
            imported += 1
        except KeyError as exc:
            errors.append(f"Row {i}: missing column {exc}")
        except Exception as exc:
            errors.append(f"Row {i}: {exc}")

    if imported:
        db.commit()

    return {"imported": imported, "errors": errors}
