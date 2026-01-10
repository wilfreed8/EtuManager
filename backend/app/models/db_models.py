from sqlalchemy import Column, String, Boolean, TIMESTAMP, ForeignKey, Integer, JSON, Date, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Establishment(Base):
    __tablename__ = "establishments"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # PRIMAIRE, COLLEGE, LYCEE
    address = Column(String)
    phone = Column(String)
    logo_url = Column(String)
    grading_config = Column(JSON, default={"interro": 25, "devoir": 25, "compo": 50})
    period_type = Column(String, default="TRIMESTRE")
    created_at = Column(TIMESTAMP, server_default=func.now())

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    avatar_url = Column(String)
    password = Column(String, default="password123") # Default password for all users for now
    is_super_admin = Column(Boolean, default=False)
    can_generate_bulletins = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

class Role(Base):
    __tablename__ = "roles"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True, nullable=False)

class UserRole(Base):
    __tablename__ = "user_roles"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    role_id = Column(String, ForeignKey("roles.id", ondelete="CASCADE"))
    establishment_id = Column(String, ForeignKey("establishments.id", ondelete="CASCADE"))

class AcademicYear(Base):
    __tablename__ = "academic_years"
    id = Column(String, primary_key=True, default=generate_uuid)
    label = Column(String, nullable=False)
    is_active = Column(Boolean, default=False)
    is_locked = Column(Boolean, default=False)
    establishment_id = Column(String, ForeignKey("establishments.id", ondelete="CASCADE"))

class Class(Base):
    __tablename__ = "classes"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    academic_year_id = Column(String, ForeignKey("academic_years.id", ondelete="CASCADE"))
    establishment_id = Column(String, ForeignKey("establishments.id", ondelete="CASCADE"))

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    coefficient = Column(Integer, default=1)
    establishment_id = Column(String, ForeignKey("establishments.id", ondelete="CASCADE"))

class TeacherAssignment(Base):
    __tablename__ = "teacher_assignments"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    class_id = Column(String, ForeignKey("classes.id", ondelete="CASCADE"))
    subject_id = Column(String, ForeignKey("subjects.id", ondelete="CASCADE"))
    academic_year_id = Column(String, ForeignKey("academic_years.id", ondelete="CASCADE"))

class Student(Base):
    __tablename__ = "students"
    id = Column(String, primary_key=True, default=generate_uuid)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    birth_date = Column(Date)
    gender = Column(String(1))
    address = Column(String)
    phone = Column(String)
    email = Column(String)
    photo_url = Column(String)
    registration_number = Column(String, unique=True)
    establishment_id = Column(String, ForeignKey("establishments.id", ondelete="CASCADE"))
    
    # Parent Info (added for flat model support)
    parent_name = Column(String)
    parent_phone = Column(String)
    parent_email = Column(String)
    parent_profession = Column(String)
    
    created_at = Column(TIMESTAMP, server_default=func.now())

class StudentEnrollment(Base):
    __tablename__ = "student_enrollments"
    id = Column(String, primary_key=True, default=generate_uuid)
    student_id = Column(String, ForeignKey("students.id", ondelete="CASCADE"))
    class_id = Column(String, ForeignKey("classes.id", ondelete="CASCADE"))
    academic_year_id = Column(String, ForeignKey("academic_years.id", ondelete="CASCADE"))

class Period(Base):
    __tablename__ = "periods"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    start_date = Column(Date)
    end_date = Column(Date)
    is_active = Column(Boolean, default=False)
    academic_year_id = Column(String, ForeignKey("academic_years.id", ondelete="CASCADE"))

class Grade(Base):
    __tablename__ = "grades"
    id = Column(String, primary_key=True, default=generate_uuid)
    student_id = Column(String, ForeignKey("students.id", ondelete="CASCADE"))
    subject_id = Column(String, ForeignKey("subjects.id", ondelete="CASCADE"))
    period_id = Column(String, ForeignKey("periods.id", ondelete="CASCADE"))
    interro_avg = Column(Numeric(4,2))
    devoir_avg = Column(Numeric(4,2))
    compo_grade = Column(Numeric(4,2))
    period_avg = Column(Numeric(4,2))
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
