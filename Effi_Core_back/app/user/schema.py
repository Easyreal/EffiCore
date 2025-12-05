from pydantic import BaseModel, EmailStr


class SUser(BaseModel):
    id: int
    login: str
    first_name: str
    last_name: str
    email: EmailStr

    class Config:
        from_attributes = True

class SUserRegister(BaseModel):
    login: str
    first_name: str
    last_name: str
    email: EmailStr
    password: str

    class Config:
        from_attributes = True


class SUserAuth(BaseModel):
    email: EmailStr
    password: str

    class Config:
        from_attributes = True


class SUserAuthFace(BaseModel):
    email: EmailStr

    class Config:
        from_attributes = True

class SUserReset(BaseModel):
    email: EmailStr

    class Config:
        from_attributes = True

class TokenInfo(BaseModel):
    efficore_token: str
    refresh_token: str | None = None
    token_type: str = 'Bearer'


class SEmailConfirmed(BaseModel):
    email: EmailStr
    status: bool

    class Config:
        from_attributes = True


class SUserChangePwd(BaseModel):
    password: str

    class Config:
        from_attributes = True

class SOperationStatus(BaseModel):
    status: bool

    class Config:
        from_attributes = True

class SUserId(BaseModel):
    id: int

    class Config:
        from_attributes = False