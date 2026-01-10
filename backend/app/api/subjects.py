from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import db_models

router = APIRouter()

@router.get("/")
async def list_subjects(db: Session = Depends(get_db)):
    return db.query(db_models.Subject).all()
