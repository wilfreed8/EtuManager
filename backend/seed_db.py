from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models import db_models
from datetime import date

def seed():
    db = SessionLocal()
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Check if data already exists
    if db.query(db_models.Role).first():
        print("Database already seeded.")
        return

    print("Seeding database...")

    # 1. Roles
    roles = [
        db_models.Role(id="role-super-admin", name="SUPER_ADMIN"),
        db_models.Role(id="role-proviseur", name="PROVISEUR"),
        db_models.Role(id="role-censeur", name="CENSEUR"),
        db_models.Role(id="role-secretaire", name="SECRETAIRE"),
        db_models.Role(id="role-enseignant", name="ENSEIGNANT"),
    ]
    db.add_all(roles)
    db.commit()

    # 2. Establishment
    est_id = "8ded3123-5e93-4702-861f-9c60e3cc6a34"
    establishment = db_models.Establishment(
        id=est_id,
        name="Lycée Moderne de Tokoin",
        type="LYCEE",
        address="Lomé, Togo",
        phone="+228 22 21 00 00",
        grading_config={"interro": 25, "devoir": 25, "compo": 50},
        period_type="TRIMESTRE"
    )
    db.add(establishment)
    db.commit()

    # 3. Academic Year
    ay_id = "cd173595-6a56-4c56-978d-6a56cd173595"
    academic_year = db_models.AcademicYear(
        id=ay_id,
        label="2024-2025",
        is_active=True,
        establishment_id=est_id
    )
    db.add(academic_year)
    db.commit()

    # 4. Classes
    classes_data = [
        {"id": "67448d3c-6f81-4b71-97b7-6de7112000ed", "name": "6ème A"},
        {"id": "class-6b", "name": "6ème B"},
        {"id": "class-5a", "name": "5ème A"},
    ]
    for c in classes_data:
        db.add(db_models.Class(id=c["id"], name=c["name"], academic_year_id=ay_id, establishment_id=est_id))
    db.commit()

    # 5. Subjects
    subjects = [
        db_models.Subject(id="sub-math", name="Mathématiques", coefficient=4, establishment_id=est_id),
        db_models.Subject(id="sub-fr", name="Français", coefficient=3, establishment_id=est_id),
        db_models.Subject(id="sub-svt", name="SVT", coefficient=2, establishment_id=est_id),
        db_models.Subject(id="sub-phys", name="Physique-Chimie", coefficient=3, establishment_id=est_id),
    ]
    db.add_all(subjects)
    db.commit()

    # 6. Periods
    periods = [
        db_models.Period(id="p1", name="Trimestre 1", is_active=True, academic_year_id=ay_id),
        db_models.Period(id="p2", name="Trimestre 2", is_active=False, academic_year_id=ay_id),
        db_models.Period(id="p3", name="Trimestre 3", is_active=False, academic_year_id=ay_id),
    ]
    db.add_all(periods)
    db.commit()

    # 7. Mock Teachers
    teachers = [
        db_models.User(id="123e4567-e89b-12d3-a456-426614174000", name="Dubois Marc", email="m.dubois@ecole.tg"),
        db_models.User(id="223e4567-e89b-12d3-a456-426614174001", name="Salami Fatou", email="f.salami@ecole.tg"),
    ]
    db.add_all(teachers)
    db.commit()

    # 8. Teacher Assignments
    assignments = [
        db_models.TeacherAssignment(user_id="123e4567-e89b-12d3-a456-426614174000", class_id=classes_data[0]["id"], subject_id="sub-math", academic_year_id=ay_id),
        db_models.TeacherAssignment(user_id="223e4567-e89b-12d3-a456-426614174001", class_id=classes_data[1]["id"], subject_id="sub-svt", academic_year_id=ay_id),
    ]
    db.add_all(assignments)
    db.commit()

    print("Success: Database seeded!")
    db.close()

if __name__ == "__main__":
    seed()
