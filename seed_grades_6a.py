import sys
import os
import random
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup path to import backend modules
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.core.database import Base, SQLALCHEMY_DATABASE_URL as DATABASE_URL
from app.models import db_models

def seed_grades_6a():
    print(f"Connecting to DB at {DATABASE_URL}")
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        print("Looking for '6ème A'...")
        # Find 6ème A
        # Since we create multiple schools, we might have multiple '6ème A'. Just pick one or all.
        classes = db.query(db_models.Class).filter(db_models.Class.name.ilike("6ème A")).all()
        
        if not classes:
            print("No class named '6ème A' found. Please run seed_root.py first.")
            return

        for cls in classes:
            print(f"Processing class: {cls.name} (ID: {cls.id}, Est: {cls.establishment_id})")
            
            # Find Active Period T1
            period = db.query(db_models.Period).filter(
                db_models.Period.academic_year_id == cls.academic_year_id,
                db_models.Period.name.ilike("Trimestre 1")
            ).first()
            
            if not period:
                print("  No 'Trimestre 1' found for this class's year.")
                continue

            # Find Subjects
            subjects = db.query(db_models.Subject).filter(
                db_models.Subject.establishment_id == cls.establishment_id
            ).all()

            # Find Students enrolled
            enrollments = db.query(db_models.StudentEnrollment).filter(
                db_models.StudentEnrollment.class_id == cls.id
            ).all()
            
            print(f"  Found {len(enrollments)} students enrolled.")
            
            count_grades = 0
            for enroll in enrollments:
                student_id = enroll.student_id
                
                # For each subject, ensure a grade exists
                for sub in subjects:
                    existing_grade = db.query(db_models.Grade).filter(
                        db_models.Grade.student_id == student_id,
                        db_models.Grade.period_id == period.id,
                        db_models.Grade.subject_id == sub.id
                    ).first()
                    
                    if not existing_grade:
                        # Create a random grade
                        new_grade = db_models.Grade(
                            student_id=student_id,
                            subject_id=sub.id,
                            period_id=period.id,
                            interro_avg=round(random.uniform(8, 20), 2),
                            devoir_avg=round(random.uniform(7, 20), 2),
                            compo_grade=round(random.uniform(6, 20), 2)
                        )
                        db.add(new_grade)
                        count_grades += 1
            
            print(f"  Added {count_grades} new grades for {cls.name}.")
        
        db.commit()
        print("Grades seeding for '6ème A' completed successfully.")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_grades_6a()
