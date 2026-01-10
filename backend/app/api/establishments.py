from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models import db_models

router = APIRouter()

@router.get("/stats")
async def get_stats(establishment_id: str = None, db: Session = Depends(get_db)):
    # Total Students
    student_query = db.query(func.count(db_models.Student.id))
    if establishment_id:
        student_query = student_query.filter(db_models.Student.establishment_id == establishment_id)
    total_students = student_query.scalar()
    
    # Total Teachers (Users with assignments)
    teacher_query = db.query(func.count(func.distinct(db_models.TeacherAssignment.user_id)))
    # Note: this is a simple approximation
    total_teachers = teacher_query.scalar()
    
    # Total Classes
    class_query = db.query(func.count(db_models.Class.id))
    if establishment_id:
        class_query = class_query.filter(db_models.Class.establishment_id == establishment_id)
    total_classes = class_query.scalar()
    
    return {
        "totalStudents": total_students,
        "totalTeachers": total_teachers,
        "classesManaged": total_classes,
        "studentsTrend": 0,
        "teachersTrend": 0,
        "gradesSubmitted": 0, # To be implemented
        "gradesPending": 0,    # To be implemented
    }

@router.get("/")
async def list_establishments(db: Session = Depends(get_db)):
    return db.query(db_models.Establishment).all()
