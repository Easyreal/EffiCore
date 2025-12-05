import numpy as np
from app.abstract_objects.abc_dao import BaseDAO
from app.verification.models import FaceEmbedding
from app.database import async_session
from sqlalchemy.sql import select

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