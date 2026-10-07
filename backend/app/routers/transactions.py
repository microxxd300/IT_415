from fastapi import APIRouter, HTTPException

from app.schemas import Receipt, TransactionRequest
from app.services.pricing import InsufficientPaymentError, PricingError
from app.services.transactions import create_transaction, get_transaction

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.post("", response_model=Receipt, status_code=201)
def pay(request: TransactionRequest) -> dict:
    try:
        return create_transaction(request)
    except InsufficientPaymentError as error:  # checked first: it is a kind of PricingError
        raise HTTPException(status_code=400, detail=str(error))
    except PricingError as error:
        raise HTTPException(status_code=422, detail=str(error))


@router.get("/{reference}", response_model=Receipt)
def receipt(reference: str) -> dict:
    found = get_transaction(reference)
    if found is None:
        raise HTTPException(status_code=404, detail="Transaction not found.")
    return found
