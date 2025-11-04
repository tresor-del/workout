from datetime import timedelta, datetime, timezone
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from dotenv import load_dotenv
import os
from sqlalchemy.orm import Session
from pydantic import BaseModel
from api.models import User
from api.deps import db_dependency, bcrypt_context

load_dotenv()

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("AUTH_ALGORITHME")

class UserCreateRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    
def authenticate_user(username: str, password: str, db: Session):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    # La fonction bcrypt_context.verify a été ajoutée pour la clarté
    if not bcrypt_context.verify(password, user.hashed_password):
        return False
    return user

def create_access_token(username: str, user_id: int, expires_delta: timedelta):
    """
    Crée un token JWT avec un timestamp Unix pour la date d'expiration.
    """
    to_encode = {"sub": username, "id": user_id}
    expires = datetime.now(timezone.utc) + expires_delta
    # CORRECTION ICI : Conversion en timestamp Unix
    to_encode.update({"exp": expires.timestamp()})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user(db: db_dependency, create_user_request: UserCreateRequest):
    create_user_model = User(
        username=create_user_request.username,
        hashed_password=bcrypt_context.hash(create_user_request.password)
    )
    db.add(create_user_model)
    db.commit()
    db.refresh(create_user_model)
    return {"message": "user created successfully"}

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                                db: db_dependency):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate user"
        )
    # Dans un vrai projet, il serait préférable d'utiliser le nom de la colonne du modèle
    # plutôt que le nom de la variable pour plus de clarté
    token = create_access_token(username=user.username, user_id=user.id, expires_delta=timedelta(minutes=20))
    
    return {"access_token": token, "token_type": "bearer"}
