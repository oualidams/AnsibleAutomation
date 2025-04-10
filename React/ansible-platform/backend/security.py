from fastapi import FastAPI, HTTPException, Depends, Security, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, SecurityScopes
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Set
from datetime import datetime, timedelta
import jwt
import bcrypt
import secrets
import string
import re
import ipaddress
from sqlalchemy.orm import Session

from database import get_db, User, Role, Permission, AuditLog

# Security settings
SECRET_KEY = "your-secret-key-here"  # Change this in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password policy
PASSWORD_MIN_LENGTH = 12
PASSWORD_REQUIRE_UPPERCASE = True
PASSWORD_REQUIRE_LOWERCASE = True
PASSWORD_REQUIRE_NUMBERS = True
PASSWORD_REQUIRE_SPECIAL = True
PASSWORD_EXPIRY_DAYS = 90

# IP restrictions
IP_RESTRICTION_ENABLED = False
ALLOWED_IPS = ["192.168.1.0/24", "10.0.0.0/8"]

# Models
class TokenData(BaseModel):
    username: str
    scopes: List[str] = []
    exp: datetime

class SecuritySettings(BaseModel):
    ssh_key_auth: bool = True
    password_auth: bool = False
    mfa_enabled: bool = True
    session_timeout: int = 30
    password_policy: Dict[str, any] = {
        "min_length": 12,
        "require_uppercase": True,
        "require_lowercase": True,
        "require_numbers": True,
        "require_special": True,
        "expiry_days": 90
    }
    ip_restriction: bool = False
    allowed_ips: List[str] = []
    audit_logging: bool = True
    ssh_key_path: str = "/etc/ansible/keys"
    vault_encryption: bool = True
    vault_password_file: str = "/etc/ansible/vault_password"

# Authentication functions
def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(
    security_scopes: SecurityScopes,
    token: str = Depends(OAuth2PasswordBearer(tokenUrl="token", scopes={"admin": "Admin access", "user": "User access"})),
    db: Session = Depends(get_db)
):
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"
        
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": authenticate_value},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_scopes = payload.get("scopes", [])
        token_data = TokenData(username=username, scopes=token_scopes, exp=payload.get("exp"))
    except jwt.PyJWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
        
    # Check if token is expired
    if datetime.fromtimestamp(token_data.exp) < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
            headers={"WWW-Authenticate": authenticate_value},
        )
        
    # Check if user has required scopes
    for scope in security_scopes.scopes:
        if scope not in token_data.scopes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
                headers={"WWW-Authenticate": authenticate_value},
            )
            
    # Check if IP is allowed (if restriction is enabled)
    if IP_RESTRICTION_ENABLED:
        client_ip = request.client.host
        ip_allowed = False
        for allowed_range in ALLOWED_IPS:
            network = ipaddress.ip_network(allowed_range)
            if ipaddress.ip_address(client_ip) in network:
                ip_allowed = True
                break
        if not ip_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access from this IP address is not allowed",
            )
            
    # Log access
    log_audit_event(db, user.id, "authentication", "User authenticated", "success")
    
    return user

# Password validation
def validate_password(password: str) -> bool:
    """Validate password against policy"""
    if len(password) < PASSWORD_MIN_LENGTH:
        return False
        
    if PASSWORD_REQUIRE_UPPERCASE and not any(c.isupper() for c in password):
        return False
        
    if PASSWORD_REQUIRE_LOWERCASE and not any(c.islower() for c in password):
        return False
        
    if PASSWORD_REQUIRE_NUMBERS and not any(c.isdigit() for c in password):
        return False
        
    if PASSWORD_REQUIRE_SPECIAL and not any(not c.isalnum() for c in password):
        return False
        
    return True

# Generate secure password
def generate_secure_password() -> str:
    """Generate a secure password that meets policy requirements"""
    length = max(16, PASSWORD_MIN_LENGTH)
    alphabet = string.ascii_letters + string.digits
    special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    
    while True:
        password = ''.join(secrets.choice(alphabet) for _ in range(length - 4))
        password += secrets.choice(string.ascii_uppercase)
        password += secrets.choice(string.ascii_lowercase)
        password += secrets.choice(string.digits)
        password += secrets.choice(special_chars)
        
        # Shuffle the password
        password_list = list(password)
        secrets.SystemRandom().shuffle(password_list)
        password = ''.join(password_list)
        
        if validate_password(password):
            return password

# Audit logging
def log_audit_event(db: Session, user_id: int, event_type: str, description: str, outcome: str):
    """Log security events for audit purposes"""
    log_entry = AuditLog(
        user_id=user_id,
        event_type=event_type,
        description=description,
        outcome=outcome,
        timestamp=datetime.utcnow(),
        ip_address="127.0.0.1"  # In a real app, get from request
    )
    db.add(log_entry)
    db.commit()

# Role-based access control
def check_permission(user: User, resource: str, action: str, db: Session) -> bool:
    """Check if user has permission to perform action on resource"""
    role = db.query(Role).filter(Role.id == user.role_id).first()
    if not role:
        return False
        
    permission = db.query(Permission).filter(
        Permission.role_id == role.id,
        Permission.resource == resource,
        Permission.action == action
    ).first()
    
    return permission is not None

# Security settings management
def get_security_settings() -> SecuritySettings:
    """Get current security settings"""
    # In a real app, these would be loaded from database or config file
    return SecuritySettings(
        ssh_key_auth=True,
        password_auth=False,
        mfa_enabled=True,
        session_timeout=30,
        password_policy={
            "min_length": PASSWORD_MIN_LENGTH,
            "require_uppercase": PASSWORD_REQUIRE_UPPERCASE,
            "require_lowercase": PASSWORD_REQUIRE_LOWERCASE,
            "require_numbers": PASSWORD_REQUIRE_NUMBERS,
            "require_special": PASSWORD_REQUIRE_SPECIAL,
            "expiry_days": PASSWORD_EXPIRY_DAYS
        },
        ip_restriction=IP_RESTRICTION_ENABLED,
        allowed_ips=ALLOWED_IPS,
        audit_logging=True,
        ssh_key_path="/etc/ansible/keys",
        vault_encryption=True,
        vault_password_file="/etc/ansible/vault_password"
    )

def update_security_settings(settings: SecuritySettings):
    """Update security settings"""
    # In a real app, these would be saved to database or config file
    global PASSWORD_MIN_LENGTH, PASSWORD_REQUIRE_UPPERCASE, PASSWORD_REQUIRE_LOWERCASE
    global PASSWORD_REQUIRE_NUMBERS, PASSWORD_REQUIRE_SPECIAL, PASSWORD_EXPIRY_DAYS
    global IP_RESTRICTION_ENABLED, ALLOWED_IPS
    
    PASSWORD_MIN_LENGTH = settings.password_policy["min_length"]
    PASSWORD_REQUIRE_UPPERCASE = settings.password_policy["require_uppercase"]
    PASSWORD_REQUIRE_LOWERCASE = settings.password_policy["require_lowercase"]
    PASSWORD_REQUIRE_NUMBERS = settings.password_policy["require_numbers"]
    PASSWORD_REQUIRE_SPECIAL = settings.password_policy["require_special"]
    PASSWORD_EXPIRY_DAYS = settings.password_policy["expiry_days"]
    
    IP_RESTRICTION_ENABLED = settings.ip_restriction
    ALLOWED_IPS = settings.allowed_ips
    
    # Other settings would be saved similarly
    return True
