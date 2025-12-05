import jwt
from jose import JWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta
from app.config import settings
from app.exceptions import IncorrectFormatJWTException
from typing import Literal


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class JwtController():

    @classmethod
    def get_password_hash(cls, password):
        return pwd_context.hash(password)

    @classmethod
    def verify_password(cls, plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)

    @classmethod
    def decode_jwt(cls, token: str) -> dict:
        try:
            return jwt.decode(token, key=settings.SECRET_KEY, algorithms=settings.HASH)
        except JWTError:
            raise IncorrectFormatJWTException

    @classmethod
    def create_token(cls, data:dict, token_type: Literal["access", "refresh", "confirm", "reset"]) -> str:
        if token_type == "access":
            token_type = settings.ACCESS_TOKEN
            time_to_add = timedelta(hours=settings.ACCESS_TOKEN_EXP)
        elif token_type == 'refresh':
            token_type = settings.REFRESH_TOKEN
            time_to_add = timedelta(hours=settings.REFRESH_TOKEN_EXP)
        elif token_type == 'confirm':
            token_type = settings.CONFIRM_EMAIL_TOKEN
            time_to_add = timedelta(hours=settings.CONFIRM_EMAIL_TOKEN_EXP)
        elif token_type == 'reset':
            token_type = settings.RESET_TOKEN
            time_to_add = timedelta(hours=settings.RESET_TOKEN_EXP)
        else:
            raise
        to_encode = data.copy()
        expire = datetime.utcnow() + time_to_add
        to_encode.update({'exp': expire, 'token_type': token_type})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.HASH)
        return encoded_jwt

    @classmethod
    async def authenticate_user(cls, password: str, user_password):
        print(password, user_password)
        if cls.verify_password(password, user_password):
            return True
        return False








