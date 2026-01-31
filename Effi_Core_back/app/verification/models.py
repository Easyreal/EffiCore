from sqlalchemy import Column, Integer, String, LargeBinary,Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from ..database import Base

class FaceEmbedding(Base):
    __tablename__ = "face_embeddings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    embedding = Column(LargeBinary, nullable=False)
    meta = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("Users", back_populates="embedding", uselist=False)


class FacePin(Base):
    __tablename__ = "face_pins"
    id = Column(Integer, primary_key=True, index=True)
    emb_id = Column(Integer, ForeignKey("face_embeddings.id"), nullable=False, unique=True, index=True)
    hashed_pin = Column(String, nullable=False)


