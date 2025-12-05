from fastapi import HTTPException, status


UserAlreadyExists = HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail='Пользователь с таким email уже существует'
)

UserLoginAlreadyExists = HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail='Пользователь с таким логином уже существует'
)

IncorrectUserEmailOrPasswordException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Неверный email или пароль'
)

EmailNotConfirmedException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Пожалуйста подтвердите электронную почту'
)

JWTExpiredException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='токен истек'
)

IncorrectTokenType = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail='неверный токен'
)

IncorrectFormatJWTException =  HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Неверный формат токена'
)

NoExistUserException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Пользователь не существует'
)



JwtDoesNotExist = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='токен не существует'
)

NoGivenToken = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail='Отсутствует токен'
)

InvalidImg = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Invalid image"
)

NoOpenImg = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Can not open image"
)

EmptyFile= HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Empty file"
)

FileTooLarge = HTTPException(
    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
    detail="File too large"
)


InvalidEmb = HTTPException(
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    detail="Invalid embedding produced"
)

NoEmbForUser = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="No embedding registered for this user"
)

EmbMiss = HTTPException(
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    detail="Embedding dimensionality mismatch"
)

NoVerificationExc = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Face verification failed"
)

NoOnSMTP = HTTPException(
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    detail="Pls turn on SMPT"
)