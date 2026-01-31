from typing import Optional

import numpy as np
from app.abstract_objects.abc_dao import BaseDAO
from app.verification.models import FaceEmbedding, FacePin
from app.user.auth import JwtController
from app.database import async_session
from sqlalchemy.sql import select, delete


class FaceDao(BaseDAO):
    model = FaceEmbedding

    @classmethod
    async def add_one(cls, user_id: int, emb: np.ndarray, meta: str = None):
        emb_bytes = emb.astype(np.float32).tobytes()
        async with async_session() as session:
            obj = cls.model(user_id=user_id, embedding=emb_bytes, meta=meta)
            session.add(obj)
            await session.commit()
            await session.refresh(obj)
            return obj

    @classmethod
    async def get_by_id(cls, user_id: int):
        async with async_session() as session:
            q = await session.execute(select(cls.model).where(FaceEmbedding.user_id == user_id))
            row = q.scalars().one_or_none()
            if row is None:
                return None
            emb = np.frombuffer(row.embedding, dtype=np.float32)
            return (row.id, row.user_id, emb)


    @classmethod
    async def get_all_embeddings(cls, limit: int = None):
        async with async_session() as session:
            q = await session.execute(select(cls.model))
            rows = q.scalars().all()
            res = [(r.id, r.user_id, np.frombuffer(r.embedding, dtype=np.float32)) for r in rows]
            return res

    @classmethod
    async def get_by_filter_or_none(cls, **filter_by):
        async with async_session() as session:
            query = select(cls.model).filter_by(**filter_by)
            result = await session.execute(query)
            return result.scalar_one_or_none()


    @classmethod
    async def delete(cls, user_id: int) -> bool:
        async with async_session() as session:
            q = await session.execute(select(cls.model).where(cls.model.user_id==user_id))
            obj = q.scalars().one_or_none()
            if not obj:
                return False
            await session.delete(obj)
            await session.commit()
            return True

    @classmethod
    async def create_or_update(cls, user_id: int, emb: np.ndarray, meta: str | None = None):
        emb_bytes = emb.astype(np.float32).tobytes()
        async with async_session() as session:
            q = await session.execute(select(cls.model).where(cls.model.user_id == user_id))
            obj = q.scalars().one_or_none()
            if obj:
                obj.embedding = emb_bytes
                if meta is not None:
                    obj.meta = meta
            else:
                obj = cls.model(user_id=user_id, embedding=emb_bytes, meta=meta)
            session.add(obj)
            await session.commit()
            await session.refresh(obj)
            return obj.id, obj




class FacePinDao:
    model = FacePin

    @classmethod
    async def add_one(cls, emb_id: int, pin: str) -> FacePin:
        hashed = JwtController.get_password_hash(password=pin)
        async with async_session() as session:
            try:
                obj = cls.model(emb_id=emb_id, hashed_pin=hashed)
                session.add(obj)
                await session.commit()
                await session.refresh(obj)
                return obj
            except Exception as e:
                return False

    @classmethod
    async def get_by_id(cls, pin_id: int) -> Optional[FacePin]:
        async with async_session() as session:
            q = await session.execute(select(cls.model).where(cls.model.id == pin_id))
            return q.scalars().one_or_none()

    @classmethod
    async def get_by_emb_id(cls, emb_id: int) -> Optional[FacePin]:
        async with async_session() as session:
            q = await session.execute(select(cls.model).where(cls.model.emb_id == emb_id))
            return q.scalars().one_or_none()



    @classmethod
    async def delete_by_id(cls, pin_id: int) -> bool:
        async with async_session() as session:
            stmt = delete(cls.model).where(cls.model.id == pin_id)
            result = await session.execute(stmt)
            await session.commit()
            return True


    @classmethod
    def verify_pin(cls, hashed_pin: str, plain_pin: str) -> bool:
        return JwtController.verify_password(plain_password=plain_pin, hashed_password=hashed_pin)
