from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import schemas, db_models
from app.core.database import get_db
from typing import List

router = APIRouter()

@router.post("/assignments", response_model=schemas.TeacherAssignment)
async def create_assignment(assignment_data: schemas.TeacherAssignmentCreate, db: Session = Depends(get_db)):
    db_assignment = db_models.TeacherAssignment(**assignment_data.dict())
    db.add(db_assignment)
    try:
        db.commit()
        db.refresh(db_assignment)
        return db_assignment
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/assignments", response_model=List[schemas.TeacherAssignment])
async def list_assignments(academic_year_id: str = None, db: Session = Depends(get_db)):
    query = db.query(db_models.TeacherAssignment)
    if academic_year_id:
        query = query.filter(db_models.TeacherAssignment.academic_year_id == academic_year_id)
    return query.all()

@router.get("/my-assignments")
async def get_my_assignments(user_id: str, db: Session = Depends(get_db)):
    # In a real app, we'd get user_id from token
    assignments = db.query(db_models.TeacherAssignment).filter(
        db_models.TeacherAssignment.user_id == user_id
    ).all()
    
    results = []
    for assign in assignments:
        cls = db.query(db_models.Class).get(assign.class_id)
        subj = db.query(db_models.Subject).get(assign.subject_id)
        
        # Count students in class
        student_count = db.query(func.count(db_models.StudentEnrollment.id)).filter(
            db_models.StudentEnrollment.class_id == assign.class_id
        ).scalar()
        
        results.append({
            "id": assign.id,
            "class_id": assign.class_id,
            "subject_id": assign.subject_id,
            "class_name": cls.name if cls else "N/A",
            "subject_name": subj.name if subj else "N/A",
            "students": student_count,
            "room": "N/A", # Not in model yet
            "gradingProgress": 0,
            "status": "pending",
            "studentsGraded": 0
        })
    return results

