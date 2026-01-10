from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.models import schemas, db_models
from app.core.database import get_db
from app.services.csv_parser import CSVParser
from app.services.pdf_generator import PDFGenerator # Just to show it's there
import json

router = APIRouter()


@router.post("/upload")
async def upload_grades(
    class_id: str,
    period_id: str,
    subject_id: str,
    file: UploadFile = File(...)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    content = await file.read()
    try:
        grades = CSVParser.parse_grades_csv(content)
        # Logic to save to Supabase would go here
        return {
            "message": "File parsed successfully",
            "received": len(grades),
            "class_id": class_id,
            "period_id": period_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[schemas.GradeResponse])
async def list_grades(
    class_id: str = None, 
    subject_id: str = None, 
    period_id: str = None, 
    db: Session = Depends(get_db)
):
    query = db.query(db_models.Grade)
    if period_id:
        query = query.filter(db_models.Grade.period_id == period_id)
    if subject_id:
        query = query.filter(db_models.Grade.subject_id == subject_id)
    # Note: filtering by class_id requires joining with StudentEnrollment or Student, complicated for now without join.
    # Assuming frontend filters or we add join later. 
    # For now let's just return all matching subject/period.
    
    return query.all()

@router.post("/", response_model=schemas.GradeResponse)
async def save_grade(grade_data: schemas.GradeCreate, db: Session = Depends(get_db)):
    # Check if grade exists
    db_grade = db.query(db_models.Grade).filter(
        db_models.Grade.student_id == grade_data.student_id,
        db_models.Grade.subject_id == grade_data.subject_id,
        db_models.Grade.period_id == grade_data.period_id
    ).first()
    
    if db_grade:
        db_grade.interro_avg = grade_data.interro_avg
        db_grade.devoir_avg = grade_data.devoir_avg
        db_grade.compo_grade = grade_data.compo_grade
        # Recalculate average logic here if needed, or trigger it
    else:
        db_grade = db_models.Grade(**grade_data.dict())
        db.add(db_grade)
    
    db.commit()
    db.refresh(db_grade)
    return db_grade

