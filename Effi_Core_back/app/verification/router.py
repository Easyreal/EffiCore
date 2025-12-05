import numpy as np
from app.user.dependencies import http_bearer
from app.config import settings
from .model_dlm import compute_embedding_async, eval_transform, get_model
from .dao import FaceDao
from app.exceptions import IncorrectUserEmailOrPasswordException, EmailNotConfirmedException, InvalidImg, NoOpenImg, \
    EmptyFile, InvalidEmb, FileTooLarge, EmbMiss, NoVerificationExc
from app.user.auth import JwtController
from app.user.dao import UserDao
from app.user.schema import SUserAuthFace, TokenInfo
import io
from PIL import Image
from fastapi import status, HTTPException, Response, UploadFile, File, Form, Depends, APIRouter

THRESHOLD_DEFAULT= settings.THRESHOLD_DEFAULT
MAX_FILE_SIZE = settings.get_max_file_size()
router = APIRouter(
    prefix='/face',
    tags=['Face'],
    dependencies=[Depends(http_bearer)],
)


@router.post("/create")
async def register_face(
    user_id: int = Form(...),
    file: UploadFile = File(...),
    meta: str | None = Form(None),
    model = Depends(get_model),
):
    if file.content_type.split("/")[0] != "image":
        raise InvalidImg
    content = await file.read()
    try:
        pil = Image.open(io.BytesIO(content)).convert("RGB")
    except Exception:
        raise NoOpenImg

    emb = await compute_embedding_async(model, pil, transform=eval_transform)
    if emb.shape[0] == 0 or not np.isfinite(emb).all():
        raise HTTPException(status_code=500, detail="Invalid embedding")
    obj = await FaceDao.add_one(user_id=user_id, emb=emb, meta=meta)
    return {"ok": True, "embedding_id": obj.id}




@router.post("/verify", response_model=TokenInfo)
async def verify_face(
    response: Response,
    email: str = Form(...),
    file: UploadFile = File(...),
    model = Depends(get_model),
) -> TokenInfo:
    user_data = SUserAuthFace(email=email)
    user = await UserDao.get_by_filter_or_none(email=user_data.email)
    if not user:
        raise IncorrectUserEmailOrPasswordException
    if not user.email_confirmed:
        raise EmailNotConfirmedException

    if file.content_type.split("/")[0] != "image":
        raise InvalidImg
    content = await file.read()
    if not content:
        raise EmptyFile
    if len(content) > MAX_FILE_SIZE:
        raise FileTooLarge
    try:
        pil = Image.open(io.BytesIO(content)).convert("RGB")
    except Exception:
        raise NoOpenImg

    try:
        q_emb = await compute_embedding_async(model, pil, transform=eval_transform)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Embedding error: {exc}")

    q_emb = np.asarray(q_emb, dtype="float32").reshape(-1)
    if q_emb.size == 0 or not np.isfinite(q_emb).all():
        raise InvalidEmb

    row = await FaceDao.get_by_id(user.id)
    if row is None:
        raise HTTPException

    emb_id, emb_user_id, stored_emb = row
    stored_emb = np.asarray(stored_emb, dtype="float32").reshape(-1)

    if stored_emb.shape[0] != q_emb.shape[0]:
        raise EmbMiss

    dist = float(np.linalg.norm(stored_emb - q_emb))
    match = dist <= THRESHOLD_DEFAULT
    if not match:
        raise NoVerificationExc

    data_to_tokens = {"sub": str(user.id)}
    access_token = JwtController.create_token(data=data_to_tokens, token_type="access")
    refresh_token = JwtController.create_token(data=data_to_tokens, token_type="refresh")

    response.set_cookie(settings.ACCESS_TOKEN, access_token, httponly=True)
    response.set_cookie(settings.REFRESH_TOKEN, refresh_token, httponly=True)
    return TokenInfo(efficore_token=access_token, refresh_token=refresh_token)





