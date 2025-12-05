import os, torch
from pydantic_settings import BaseSettings

file_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(file_dir)
dotenv_path = os.path.join(parent_dir, ".env")


class Settings(BaseSettings):
    # Database settings
    DB_USER: str
    DB_PASS: str
    DB_HOST: str
    DB_PORT: int
    DB_NAME: str

    # STMP settings
    SMTP_HOST:str
    SMTP_PORT:int
    SMTP_EMAIL:str
    SMTP_PASS:str
    SMTP: int

    # Redis settings
    REDIS_HOST:str
    REDIS_PORT:int

    # JWT settings
    HASH: str
    SECRET_KEY: str

    # JWT Tokens
    ACCESS_TOKEN: str = "efficore_token"
    REFRESH_TOKEN: str = "refresh_token"
    CONFIRM_EMAIL_TOKEN: str = 'confirm_email'
    RESET_TOKEN: str = 'reset_token'

    #JWT time to expire in hours
    ACCESS_TOKEN_EXP: int = 1
    REFRESH_TOKEN_EXP: int = 240
    CONFIRM_EMAIL_TOKEN_EXP: int = 24
    RESET_TOKEN_EXP: int = 24

    #Face settings
    MAX_FILE_SIZE_MB: int
    IMG_SIZE: int
    MODEL_WEIGHTS_PATH: str
    EMBED_DIM:int
    THRESHOLD_DEFAULT: float
    DEVICE: str = ''


    def get_db_url(self):
        DATABASE_URL = f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASS}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        return DATABASE_URL

    def get_max_file_size(self):
        return (self.MAX_FILE_SIZE_MB * 1024 * 1024)

    def get_device(self):
        if self.DEVICE is None:
            if self.DEVICE.lower() == "mps" and torch.backends.mps.is_available():
                return torch.device("mps")
            if self.DEVICE.lower() == "cuda" and torch.cuda.is_available():
                return torch.device("cuda")
            return torch.device(self.device)
        if torch.backends.mps.is_available():
            return torch.device("mps")
        if torch.cuda.is_available():
            return torch.device("cuda")
        return torch.device("cpu")

    def get_autcast_kwargs(self):
        return dict(device_type="mps", dtype=torch.float16, enabled=(self.get_device() == "mps"))



    class Config:
        env_file = dotenv_path

settings = Settings()
