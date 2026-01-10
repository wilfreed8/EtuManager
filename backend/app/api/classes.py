from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import db_models

router = APIRouter()

@router.get("/")
async def list_classes(db: Session = Depends(get_db)):
    # You might want to define a schema for ClassResponse, but default ORM mode often works if simple
    return db.query(db_models.Class).all()
