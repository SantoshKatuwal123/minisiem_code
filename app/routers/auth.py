from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import re
# For database
from ..database import get_db

# For models
from app.model.user import User

# For schemas
from ..schemas.user import UserCreate, UserResponse, UserLogin

from ..utils.security import hash_password, verify_password, create_access_token


router = APIRouter(
    prefix="/api/auth",
    tags=["auth"],
  

)

# ---------------- Register ----------------
@router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        
        PASSWORD_REGEX = r"^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{4,16}$"

        if not re.match(PASSWORD_REGEX, user.password):
            return {
                "status_code": status.HTTP_400_BAD_REQUEST,
                "success": False,
                "data": None,
                "message": "Password must be 4-16 characters and include letters, numbers, and symbols"
            }
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            return {
                "success": False,
                "data": None,
                "message": "Email already registered"
            }

        # Hash the password
        hashed_pwd = hash_password(user.password)

        # Create user record
        db_user = User(
            fullname=user.fullname,
            email=user.email,
            hashed_password=hashed_pwd
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        return {
            "status_code": status.HTTP_201_CREATED,
            "success": True,
            "data": {
                "id": db_user.id,
                "fullname": db_user.fullname,
                "email": db_user.email
            },
            "message": "User registered successfully"
        }
    except Exception as e:
        return {
            "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
            "success": False,
            "data": None,
            "message": f"Registration failed: {str(e)}"
        }
    




# ---------------- Login ----------------
@router.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    try:
        db_user = db.query(User).filter(User.email == user.email).first()
        if not db_user or not verify_password(user.password, db_user.hashed_password):
            return {
                "status_code": status.HTTP_401_UNAUTHORIZED,
                "success": False,
                "data": None,
                "message": "Invalid email or password"
            }

        # Create JWT token (if you plan to use JWT)
        token = create_access_token({"user_id": db_user.id, "email": db_user.email})

        return {
            "status_code": status.HTTP_200_OK,
            "success": True,
            "data": {
                "user": {
                    "id": db_user.id,
                    "fullname": db_user.fullname,
                    "email": db_user.email
                },
                "token": token
            },
            "message": "Login successful"
        }
    except Exception as e:
        return {
            "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
            "success": False,
            "data": None,
            "message": f"Login failed: {str(e)}"
        }