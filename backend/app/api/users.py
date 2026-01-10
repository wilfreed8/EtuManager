from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import db_models, schemas
import uuid

router = APIRouter()

@router.get("/", response_model=List[schemas.UserResponse])
async def list_users(role: str = None, db: Session = Depends(get_db)):
    query = db.query(db_models.User)
    
    if role == "ENSEIGNANT":
        query = query.filter(db_models.User.is_super_admin == False, db_models.User.can_generate_bulletins == False)
    # Add other role filters if needed
    
    users = query.all()
    # Enrich with 'role' field for response
    results = []
    for u in users:
        role_label = "ENSEIGNANT"
        if u.is_super_admin:
            role_label = "SUPER_ADMIN"
        elif u.can_generate_bulletins:
            role_label = "PROVISEUR"
            
        u.role = role_label # Dynamically add attribute for Pydantic
        results.append(u)
        
    return results

@router.post("/", response_model=schemas.UserResponse)
async def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(db_models.User).filter(db_models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = db_models.User(
        name=user.name,
        email=user.email,
        password=user.password or "password123",
        is_super_admin=user.is_super_admin,
        can_generate_bulletins=user.can_generate_bulletins,
        avatar_url=user.avatar_url,
        id=str(uuid.uuid4())
    )
    db.add(db_user)
    try:
        db.commit()
        db.refresh(db_user)
        # Assign role for response
        role_label = "ENSEIGNANT"
        if db_user.is_super_admin:
            role_label = "SUPER_ADMIN"
        elif db_user.can_generate_bulletins:
            role_label = "PROVISEUR"
        db_user.role = role_label
        return db_user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
