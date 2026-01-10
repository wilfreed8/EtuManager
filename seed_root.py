import sys
import os
import random
import uuid
from datetime import date, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# setup path
# If running from root: python seed_root.py
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
print(f"Inserted {backend_dir} to sys.path at index 0")
print(f"Sys Path: {sys.path}")

try:
    print("Importing app.core.database...")
    from app.core.database import Base, SQLALCHEMY_DATABASE_URL as DATABASE_URL
    print("Success: app.core.database")

    print("Importing app.models.db_models...")
    from app.models import db_models
    print("Success: app.models.db_models")

    print("Importing Faker...")
    from faker import Faker
    fake = Faker(['fr_FR'])
    print("Imports successful")
except ImportError as e:
    print(f"ImportError during setup: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
except Exception as e:
    print(f"Error: {e}")
    traceback.print_exc()
    sys.exit(1)

def init_db():
    print(f"Connecting to DB at {DATABASE_URL}")
    engine = create_engine(DATABASE_URL)
    # Ensure tables exist
    print("Creating tables if they don't exist...")
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()

def seed_data():
    try:
        db = init_db()
        print("Beginning data seeding...")

        schools_data = [
            {"name": "Lycée Moderne de Lomé", "type": "LYCEE"},
            {"name": "Collège Saint-Joseph", "type": "COLLEGE"}
        ]

        subjects_list = [
            "Mathématiques", "Français", "Anglais", "Physique-Chimie", 
            "SVT", "Histoire-Géo", "EPS", "Philosophie"
        ]

        classes_list = [
            "6ème A", "6ème B", "5ème A", "5ème B", 
            "4ème A", "4ème B", "3ème A", "3ème B", 
            "2nde A", "2nde C", "1ère A", "1ère C", "Tle A", "Tle C"
        ]

        for school_info in schools_data:
            print(f"Creating school: {school_info['name']}")
            establishment = db_models.Establishment(
                name=school_info['name'],
                type=school_info['type'],
                address=fake.address(),
                phone=fake.phone_number()
            )
            db.add(establishment)
            db.flush()

            year = db_models.AcademicYear(
                label="2025-2026",
                is_active=True,
                establishment_id=establishment.id
            )
            db.add(year)
            db.flush()

            periods = []
            for i, p_name in enumerate(["Trimestre 1", "Trimestre 2", "Trimestre 3"]):
                period = db_models.Period(
                    name=p_name,
                    is_active=(i == 0),
                    start_date=date(2025, 9, 15) + timedelta(days=i*90),
                    end_date=date(2025, 12, 15) + timedelta(days=i*90),
                    academic_year_id=year.id
                )
                db.add(period)
                periods.append(period)
            db.flush()
            current_period = periods[0]

            subjects = []
            for subj_name in subjects_list:
                subject = db_models.Subject(
                    name=subj_name,
                    coefficient=random.randint(1, 4),
                    establishment_id=establishment.id
                )
                db.add(subject)
                subjects.append(subject)
            db.flush()

            classes = []
            selected_classes = classes_list[:10]
            for class_name in selected_classes:
                cls = db_models.Class(
                    name=class_name,
                    academic_year_id=year.id,
                    establishment_id=establishment.id
                )
                db.add(cls)
                classes.append(cls)
            db.flush()

            teachers = []
            for _ in range(8):
                t_user = db_models.User(
                    name=f"Prof. {fake.last_name()}",
                    email=fake.unique.email(),
                )
                db.add(t_user)
                db.flush()
                teachers.append(t_user)
            
            for t in teachers:
                my_classes = random.sample(classes, 2)
                my_subject = random.choice(subjects)
                for c in my_classes:
                    assign = db_models.TeacherAssignment(
                        user_id=t.id,
                        class_id=c.id,
                        subject_id=my_subject.id,
                        academic_year_id=year.id
                    )
                    db.add(assign)

            print(f"  Generating 1000 students for {school_info['name']}...")
            for cls_idx, cls in enumerate(classes):
                students_per_class = 100
                for _ in range(students_per_class):
                    gender = random.choice(['M', 'F'])
                    first_name = fake.first_name_male() if gender == 'M' else fake.first_name_female()
                    
                    student = db_models.Student(
                        first_name=first_name,
                        last_name=fake.last_name(),
                        birth_date=fake.date_of_birth(minimum_age=10, maximum_age=18),
                        gender=gender,
                        address=fake.address(),
                        establishment_id=establishment.id,
                        registration_number=f"MAT-{fake.unique.random_number(digits=6)}",
                        parent_name=fake.name(),
                        parent_phone=fake.phone_number(),
                        parent_email=fake.email()
                    )
                    db.add(student)
                    db.flush()

                    enroll = db_models.StudentEnrollment(
                        student_id=student.id,
                        class_id=cls.id,
                        academic_year_id=year.id
                    )
                    db.add(enroll)

                    if random.random() < 0.5:
                        my_subjects = random.sample(subjects, k=random.randint(3, 8))
                        for sub in my_subjects:
                            grade = db_models.Grade(
                                student_id=student.id,
                                subject_id=sub.id,
                                period_id=current_period.id,
                                interro_avg=round(random.uniform(5, 20), 2),
                                devoir_avg=round(random.uniform(5, 20), 2),
                                compo_grade=round(random.uniform(5, 20), 2)
                            )
                            db.add(grade)
                
                print(f"    Class {cls.name} done.")
            
            db.commit()

        # Add Fixed Test Accounts
        print("Adding deterministic test accounts...")
        fixed_users = [
            {"name": "Thomas Anderson", "email": "admin@lycee.tg", "role": "PROVISEUR"},
            {"name": "M. Dubois", "email": "teacher@lycee.tg", "role": "ENSEIGNANT"}
        ]
        
        for u_data in fixed_users:
            user = db.query(db_models.User).filter(db_models.User.email == u_data['email']).first()
            if not user:
                user = db_models.User(
                    name=u_data['name'],
                    email=u_data['email'],
                    is_super_admin=(u_data['role'] == 'SUPER_ADMIN'),
                    can_generate_bulletins=(u_data['role'] in ['PROVISEUR', 'CENSEUR'])
                )
                db.add(user)
                db.flush()
                print(f"  Created user: {u_data['email']}")
            
            # If it's a teacher, assign to a class/subject
            if u_data['role'] == 'ENSEIGNANT':
                # Just pick first school and its first class/subject for consistency
                first_school = db.query(db_models.Establishment).first()
                if first_school:
                    year = db.query(db_models.AcademicYear).filter(db_models.AcademicYear.establishment_id == first_school.id).first()
                    cls = db.query(db_models.Class).filter(db_models.Class.establishment_id == first_school.id).first()
                    sub = db.query(db_models.Subject).filter(db_models.Subject.establishment_id == first_school.id).first()
                    
                    if cls and sub and year:
                        # Check count to avoid duplicate assignments
                        existing = db.query(db_models.TeacherAssignment).filter_by(
                            user_id=user.id, class_id=cls.id, subject_id=sub.id
                        ).first()
                        if not existing:
                            assign = db_models.TeacherAssignment(
                                user_id=user.id,
                                class_id=cls.id,
                                subject_id=sub.id,
                                academic_year_id=year.id
                            )
                            db.add(assign)
                            print(f"  Assigned teacher {u_data['email']} to {cls.name}")

        db.commit()
        print("Data seeding completed successfully!")

    
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    seed_data()
