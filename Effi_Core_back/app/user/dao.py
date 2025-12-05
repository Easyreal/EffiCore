from sqlalchemy import insert

from app.abstract_objects.abc_dao import BaseDAO
from app.user.models import Users
from app.config import settings
from app.database import async_session
from sqlalchemy.sql import select, update


class UserDao(BaseDAO):
    model = Users


    @classmethod
    async def add_one(cls, user_data, hashed_pass):
        async with async_session() as session:
            if settings.SMTP:
                query = (
                    insert(cls.model)
                    .values(
                        login=user_data.login,
                        first_name=user_data.first_name,
                        last_name=user_data.last_name,
                        email=user_data.email,
                        hashed_password=hashed_pass,
                    )
                    .returning(cls.model.id)
                )
            else:
                query = (
                    insert(cls.model)
                    .values(
                        login=user_data.login,
                        first_name=user_data.first_name,
                        last_name=user_data.last_name,
                        email=user_data.email,
                        hashed_password=hashed_pass,
                        email_confirmed=True
                    )
                    .returning(cls.model.id)
                )

            result = await session.execute(query)
            new_id = result.scalar_one_or_none()
            await session.commit()
            return new_id

    @classmethod
    async def get_by_filter_or_none(cls, **filter_by):
        async with async_session() as session:
            query = select(cls.model).filter_by(**filter_by)
            result = await session.execute(query)
            return result.scalar_one_or_none()

    @classmethod
    async def get_by_id(cls, user_id):
        async with async_session() as session:
            user_id = int(user_id)
            query = select(cls.model).filter_by(id=user_id)
            result = await session.execute(query)
            return result.scalar_one()

    @classmethod
    async def confirm_email(cls, email):
        async with async_session() as session:
            query = update(cls.model).filter_by(email=email).values(email_confirmed=True)
            await session.execute(query)
            await session.commit()

    @classmethod
    async def reset_password(cls, email, hashed_password):
        async with async_session() as session:
            query = update(cls.model).filter_by(email=email).values(hashed_password=hashed_password)
            await session.execute(query)
            await session.commit()