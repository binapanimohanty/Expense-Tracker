import csv
import io
from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import User
from app.services.transaction_service import get_transactions_for_export

router = APIRouter(prefix="/api/report", tags=["Report"])


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
