from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models import schemas, db_models
from app.core.database import get_db
import uuid

router = APIRouter()

@router.post("/login")
async def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    # Query user from DB
    user = db.query(db_models.User).filter(db_models.User.email == login_data.email).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur non trouvé dans la base de données")
    
    # Check password (simple check for now)
    # If the user was just created, it might have default 'password123'
    if login_data.password != "password123":
         # In a real app, use password hashing
         raise HTTPException(status_code=401, detail="Mot de passe incorrect")

    # Determine role (Enseignant, Proviseur, etc.)
    # For now, we use is_super_admin and can_generate_bulletins to infer roles for the mock UI
    role = "ENSEIGNANT"
    if user.is_super_admin:
        role = "SUPER_ADMIN"
    elif user.can_generate_bulletins:
        role = "PROVISEUR" # Defaulting can_generate to Proviseur for now
    
    # Create a mock token
    token = f"mock-token-{uuid.uuid4()}"
    
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": role,
        "is_super_admin": user.is_super_admin,
        "can_generate_bulletins": user.can_generate_bulletins,
        "token": token
    }

