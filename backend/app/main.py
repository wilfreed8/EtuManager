from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import grades, bulletins, students, teachers, auth, establishments, users, classes, subjects
from app.core.database import engine, Base
from app.models import db_models

# Initialize Database
Base.metadata.create_all(bind=engine)

app = FastAPI(title="EduManager API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, specify the actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to EduManager API", "status": "online"}

# Include routers
app.include_router(grades.router, prefix="/api/grades", tags=["Grades"])
app.include_router(bulletins.router, prefix="/api/bulletins", tags=["Bulletins"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(teachers.router, prefix="/api/teachers", tags=["Teachers"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(establishments.router, prefix="/api/establishments", tags=["Establishments"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(classes.router, prefix="/api/classes", tags=["Classes"])
app.include_router(subjects.router, prefix="/api/subjects", tags=["Subjects"])

