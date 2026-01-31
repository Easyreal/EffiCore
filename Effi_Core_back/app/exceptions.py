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
    detail='Пожалуйста, подтвердите электронную почту'
)

JWTExpiredException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Токен истёк'
)

IncorrectTokenType = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail='Неверный тип токена'
)

IncorrectFormatJWTException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Неверный формат токена'
)

NoExistUserException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Пользователь не существует'
)

JwtDoesNotExist = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail='Токен не найден'
)

NoGivenToken = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail='Отсутствует токен'
)

InvalidImg = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Неверный формат изображения"
)

NoOpenImg = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Не удалось открыть изображение"
)

EmptyFile = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Пустой файл"
)

FileTooLarge = HTTPException(
    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
    detail="Файл слишком большой"
)

InvalidEmb = HTTPException(
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    detail="Неверный эмбеддинг"
)

NoEmbForUser = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Эмбеддинг для пользователя не найден"
)

EmbMiss = HTTPException(
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    detail="Несоответствие размерности эмбеддингов"
)

NoVerificationExc = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Проверка по лицу не пройдена"
)

NoOnSMTP = HTTPException(
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    detail="Включите SMTP на сервере"
)

CantSaveEmb = HTTPException(
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    detail="Не удалось сохранить эмбеддинг"
)