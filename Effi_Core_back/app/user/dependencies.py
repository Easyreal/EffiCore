from datetime import datetime
from fastapi import Depends
from fastapi.security import (HTTPBearer, HTTPAuthorizationCredentials)
from app.config import settings
from app.exceptions import (
    JWTExpiredException,
    NoExistUserException,
    IncorrectTokenType,
    NoGivenToken
)
from app.user.dao import UserDao
from app.user.models import Users
from app.user.auth import JwtController

http_bearer = HTTPBearer(auto_error=False)

def get_credentials(credentials: HTTPAuthorizationCredentials = Depends(http_bearer))  -> str:
    try:
        return credentials.credentials
    except AttributeError:
        raise NoGivenToken

async def get_payload(token: str = Depends(get_credentials)):
    return JwtController.decode_jwt(token)

async def get_current_user_to_refresh(payload: dict = Depends(get_payload)) -> Users:
    token_type: str = payload.get('token_type')
    expire: str = payload.get('exp')
    if token_type != settings.REFRESH_TOKEN:
        raise IncorrectTokenType
    if expire and (int(expire) <= datetime.utcnow().timestamp()):
        raise JWTExpiredException
    user_id: str = payload.get('sub')
    if not user_id:
        raise NoExistUserException
    user = await UserDao.get_by_id(user_id)
    if not user or not user.is_active:
        raise NoExistUserException
    return user

async def get_current_user_to_access(payload: dict = Depends(get_payload)) -> Users:
    token_type: str = payload.get('token_type')
    expire: str = payload.get('exp')
    if token_type != settings.ACCESS_TOKEN:
        raise IncorrectTokenType
    if expire and (int(expire) <= datetime.utcnow().timestamp()):
        raise JWTExpiredException
    user_id: str = payload.get('sub')
    if not user_id:
        raise NoExistUserException
    user = await UserDao.get_by_id(user_id)
    if not user or not user.is_active:
        raise NoExistUserException
    return user