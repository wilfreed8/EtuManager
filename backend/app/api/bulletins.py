from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.services.pdf_generator import PDFGenerator
from app.core.database import get_db
from app.models import db_models
import io
import zipfile

router = APIRouter()
pdf_gen = PDFGenerator()

def calculate_averages(student_id: str, period_id: str, db: Session):
    # Fetch all grades for this student and period
    grades = db.query(db_models.Grade).filter(
        db_models.Grade.student_id == student_id,
        db_models.Grade.period_id == period_id
    ).all()
    
    if not grades:
        return None

    grades_data = []
    total_points = 0
    total_coef = 0

    for grade in grades:
        # Calculate subject average: (Interro*1 + Devoir*1 + Compo*2) / 4 ?? 
        # or (Interro*0.25 + Devoir*0.25 + Compo*0.5)? 
        # The prompt mentioned 25%, 25%, 50% which sums to 1. So it's weighted average.
        
        # Check for missing values, treat as 0 or skip? usually 0 if registered.
        i = grade.interro_avg or 0
        d = grade.devoir_avg or 0
        c = grade.compo_grade or 0
        
        average = (i * 0.25) + (d * 0.25) + (c * 0.5)
        
        # Get subject info for coefficient
        subject = db.query(db_models.Subject).get(grade.subject_id)
        if not subject:
            continue
            
        # Mock coefficient if not in DB (Subject model might not have it yet)
        # Using a default of 2 for now
        coef = getattr(subject, 'coefficient', 2) 
        
        grades_data.append({
            'subject': subject.name,
            'coef': coef,
            'interro': i,
            'devoir': d,
            'compo': c,
            'moyenne': average,
            'appreciation': 'Passable' if average >= 10 else 'Faible' # Simple logic
        })
        
        total_points += average * coef
        total_coef += coef

    general_avg = total_points / total_coef if total_coef > 0 else 0
    
    return {
        'grades_data': grades_data,
        'general_avg': general_avg
    }

def get_class_rank(student_id: str, class_id: str, period_id: str, db: Session):
    # This is expensive, calculating for everyone. In prod, cache this.
    # Get all students in class
    enrollments = db.query(db_models.StudentEnrollment).filter(db_models.StudentEnrollment.class_id == class_id).all()
    
    averages = []
    student_avg = 0
    
    for enrollment in enrollments:
        stats = calculate_averages(enrollment.student_id, period_id, db)
        if stats:
            avg = stats['general_avg']
            averages.append(avg)
            if enrollment.student_id == student_id:
                student_avg = avg
    
    averages.sort(reverse=True)
    try:
        rank = averages.index(student_avg) + 1
        return f"{rank}e" if rank > 1 else "1er"
    except ValueError:
        return "-"

@router.get("/download-single/{student_id}")
async def download_single_bulletin(student_id: str, period_id: str = "T1", db: Session = Depends(get_db)):
    student = db.query(db_models.Student).get(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    # Get class info
    enrollment = db.query(db_models.StudentEnrollment).filter(db_models.StudentEnrollment.student_id == student_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Student not enrolled in any class")
    
    cls = db.query(db_models.Class).get(enrollment.class_id)
    
    # Calculate stats
    stats = calculate_averages(student_id, period_id, db)
    if not stats:
        raise HTTPException(status_code=400, detail="No grades found for this period")
        
    rank = get_class_rank(student_id, enrollment.class_id, period_id, db)
    
    student_data = {
        'name': f"{student.first_name} {student.last_name}",
        'matricule': student.registration_number,
        'academic_year': '2023-2024', # TODO: Get from enrollment/academic year
        'period': 'Trimestre 1' if period_id == 'T1' else period_id,
        'class': cls.name if cls else "Unknown",
        'rank': rank,
        'general_avg': stats['general_avg']
    }
    
    school_info = {
        'name': 'Lycée Moderne de Tokoin', # Could fetch from Establishment table
        'address': 'Lomé, Togo',
        'phone': '+228 22 21 00 00'
    }

    try:
        pdf_content = pdf_gen.generate_report_card(student_data, stats['grades_data'], school_info)
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=bulletin_{student.registration_number}.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download-bulk/{class_id}")
async def download_bulk_bulletins(class_id: str, period_id: str = "T1", db: Session = Depends(get_db)):
    enrollments = db.query(db_models.StudentEnrollment).filter(db_models.StudentEnrollment.class_id == class_id).all()
    if not enrollments:
        raise HTTPException(status_code=404, detail="No students in this class")
        
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
         for enrollment in enrollments:
            try:
                # Reuse logic (refactor this ideally)
                student = db.query(db_models.Student).get(enrollment.student_id)
                stats = calculate_averages(student.id, period_id, db)
                if not stats:
                    continue # Skip students with no grades
                
                rank = get_class_rank(student.id, class_id, period_id, db)
                
                cls = db.query(db_models.Class).get(class_id)
                
                student_data = {
                    'name': f"{student.first_name} {student.last_name}",
                    'matricule': student.registration_number,
                    'academic_year': '2023-2024',
                    'period': period_id,
                    'class': cls.name,
                    'rank': rank,
                    'general_avg': stats['general_avg']
                }
                
                school_info = {'name': 'Lycée Moderne', 'address': 'Lomé', 'phone': ''}
                
                pdf_content = pdf_gen.generate_report_card(student_data, stats['grades_data'], school_info)
                zip_file.writestr(f"bulletin_{student.registration_number}.pdf", pdf_content)
            except Exception as e:
                print(f"Error generating for {enrollment.student_id}: {e}")
                continue

    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/x-zip-compressed",
        headers={"Content-Disposition": f"attachment; filename=bulletins_{class_id}.zip"}
    )
