from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime

class StudentBase(BaseModel):
    first_name: str
    last_name: str
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    registration_number: Optional[str] = None
    establishment_id: str
    parent_name: Optional[str] = None
    parent_phone: Optional[str] = None
    parent_email: Optional[EmailStr] = None
    parent_profession: Optional[str] = None

class StudentCreate(StudentBase):
    class_id: str # For initial enrollment
    academic_year_id: str

class Student(StudentBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class TeacherAssignmentBase(BaseModel):
    user_id: str
    class_id: str
    subject_id: str
    academic_year_id: str

class TeacherAssignmentCreate(TeacherAssignmentBase):
    pass


class TeacherAssignment(TeacherAssignmentBase):
    id: str

    class Config:
        from_attributes = True

class GradeBase(BaseModel):
    student_id: str
    subject_id: str
    period_id: str
    interro_avg: Optional[float] = None
    devoir_avg: Optional[float] = None
    compo_grade: Optional[float] = None

class GradeCreate(GradeBase):
    pass

class GradeResponse(GradeBase):
    id: str
    period_avg: Optional[float] = None
    
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: str
    password: str

class UserBase(BaseModel):
    name: str
    email: EmailStr
    is_super_admin: Optional[bool] = False
    can_generate_bulletins: Optional[bool] = False
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: Optional[str] = "password123"

class UserResponse(UserBase):
    id: str
    role: Optional[str] = "ENSEIGNANT"
    token: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

