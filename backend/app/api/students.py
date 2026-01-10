from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models import schemas, db_models
from app.core.database import get_db
from typing import List

router = APIRouter()

@router.post("/", response_model=schemas.Student)
async def create_student(student_data: schemas.StudentCreate, db: Session = Depends(get_db)):
    # 1. Create Student
    db_student = db_models.Student(
        **student_data.dict(exclude={"class_id", "academic_year_id"})
    )
    db.add(db_student)
    db.flush() # Get the generated ID
    
    # 2. Create Enrollment
    db_enrollment = db_models.StudentEnrollment(
        student_id=db_student.id,
        class_id=student_data.class_id,
        academic_year_id=student_data.academic_year_id
    )
    db.add(db_enrollment)
    
    try:
        db.commit()
        db.refresh(db_student)
        return db_student
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[schemas.Student])
async def list_students(establishment_id: str = None, class_id: str = None, db: Session = Depends(get_db)):
    query = db.query(db_models.Student)
    
    if class_id:
        # Join with enrollment
        query = query.join(db_models.StudentEnrollment).filter(db_models.StudentEnrollment.class_id == class_id)
    elif establishment_id:
        query = query.filter(db_models.Student.establishment_id == establishment_id)
        
    return query.all()
