from datetime import datetime
from fastapi.routing import APIRouter
from fastapi import Response, Depends
from app.user.schema import SUserAuth, SUser, SUserRegister, TokenInfo, SUserReset, SOperationStatus, SUserChangePwd, \
    SUserId
from app.user.auth import JwtController
from app.user.dao import UserDao
from app.config import settings
from app.user.dependencies import get_current_user_to_access, get_current_user_to_refresh, http_bearer
from app.user.models import Users
from app.tasks.tasks import send_confirm_email, send_reset_password
from app.exceptions import UserAlreadyExists, JWTExpiredException, IncorrectUserEmailOrPasswordException, \
    EmailNotConfirmedException, NoExistUserException, UserLoginAlreadyExists, NoOnSMTP



router = APIRouter(
    prefix='/auth',
    tags=['Auth'],
    dependencies=[Depends(http_bearer)],
)


@router.get('/user/me')
async def get_info_about_user(user: SUser = Depends(get_current_user_to_access)) -> SUser:
    return SUser.model_validate(user)


@router.post('/login')
async def login(response: Response,user_data: SUserAuth) -> TokenInfo:
    user = await UserDao.get_by_filter_or_none(email=user_data.email)
    if not user:
        raise IncorrectUserEmailOrPasswordException
    elif not user.email_confirmed:
        raise EmailNotConfirmedException
    logging = await JwtController.authenticate_user(user_data.password, user.hashed_password)
    if not logging:
        raise IncorrectUserEmailOrPasswordException
    data_to_tokens = {'sub': str(user.id)}

    access_token = JwtController.create_token(data=data_to_tokens, token_type='access')
    refresh_token = JwtController.create_token(data=data_to_tokens, token_type='refresh')
    response.set_cookie(settings.ACCESS_TOKEN, access_token, httponly=True)
    response.set_cookie(settings.REFRESH_TOKEN, refresh_token, httponly=True)
    return TokenInfo(efficore_token=access_token, refresh_token=refresh_token)

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(settings.ACCESS_TOKEN)
    response.delete_cookie(settings.REFRESH_TOKEN)


@router.post("/register")
async def register_user(user_data: SUserRegister) -> SUserId:
    existing_user = await UserDao.get_by_filter_or_none(email=user_data.email)
    if existing_user:
        if existing_user.login == user_data.login:
            raise UserLoginAlreadyExists
        if existing_user.email == user_data.email:
            raise UserAlreadyExists
    hashed_pass = JwtController.get_password_hash(password=user_data.password)
    if settings.SMTP:
        send_confirm_email.delay(user_data.email)
    user_id = await UserDao.add_one(user_data, hashed_pass)
    return SUserId(id=user_id)


@router.get('/confirm/email/{token:str}')
async def confirm_email(token: str)-> SOperationStatus:
    payload = JwtController.decode_jwt(token)
    expire = payload.get('exp')
    email = payload.get('email')
    if expire and (int(expire) <= datetime.utcnow().timestamp()):
        raise JWTExpiredException
    await UserDao.confirm_email(email=email)
    return SOperationStatus(status=True)

@router.post(
    "/refresh",
    response_model=TokenInfo,
    response_model_exclude_none=True,
)
async def refresh_jwt(
        response: Response,
        user: Users = Depends(get_current_user_to_refresh),
):

    if not user:
        raise NoExistUserException
    jwt_data = {'sub': str(user.id)}
    access_token = JwtController.create_token(data=jwt_data, token_type='access')
    response.set_cookie(settings.ACCESS_TOKEN, access_token, httponly=True)
    return TokenInfo(
        efficore_token=access_token
    )


@router.post("/reset")
async def reset_password_first_step(user_email: SUserReset) -> SOperationStatus:
    user = await UserDao.get_by_filter_or_none(email=user_email.email)
    if not user:
        raise NoExistUserException
    if not user.email_confirmed:
        raise EmailNotConfirmedException
    if not settings.SMTP:
        raise NoOnSMTP
    send_reset_password.delay(user_email.email)
    return SOperationStatus(status=True)


@router.patch(
    '/reset/email_confirmed/{token:str}',
)
async def reset_password_last_step(token: str, user_data: SUserChangePwd) -> SOperationStatus:
    payload = JwtController.decode_jwt(token)
    email = payload.get('email')
    hashed_pass = JwtController.get_password_hash(password=user_data.password)
    await UserDao.reset_password(email=email, hashed_password=hashed_pass)
    return SOperationStatus(status=True)


