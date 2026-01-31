import numpy as np
from app.config import settings
from .model_dlm import compute_embedding_async, eval_transform, get_model
from .dao import FaceDao, FacePinDao
from app.exceptions import IncorrectUserEmailOrPasswordException, EmailNotConfirmedException, InvalidImg, NoOpenImg, \
    EmptyFile, InvalidEmb, FileTooLarge, EmbMiss, NoVerificationExc, NoGivenToken, NoEmbForUser, CantSaveEmb
from app.user.auth import JwtController
from app.user.dao import UserDao
from app.user.dependencies import get_current_user_to_access, get_current_user_to_refresh, http_bearer
from app.user.schema import SUserAuthFace, TokenInfo
import io
from PIL import Image
from fastapi import status, HTTPException, Response, UploadFile, File, Form, Depends, APIRouter
from fastapi.responses import JSONResponse

THRESHOLD_DEFAULT= settings.THRESHOLD_DEFAULT
MAX_FILE_SIZE = settings.get_max_file_size()
router = APIRouter(
    prefix='/face',
    tags=['Face'],
    dependencies=[Depends(http_bearer)],
)

@router.get("/status")
async def get_emb_by_user(current_user = Depends(get_current_user_to_access),):
    user_id = current_user.id
    row = await FaceDao.get_by_id(user_id)
    return {'emb': bool(row)}

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
        raise InvalidEmb
    try:
        obj = await FaceDao.add_one(user_id=user_id, emb=emb, meta=meta)
    except Exception:
        raise CantSaveEmb
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
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ошибка вычисления эмбеддинга: {exc}")

    q_emb = np.asarray(q_emb, dtype="float32").reshape(-1)
    if q_emb.size == 0 or not np.isfinite(q_emb).all():
        raise InvalidEmb

    row = await FaceDao.get_by_id(user.id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Эмбеддинг для пользователя не найден")

    emb_id, emb_user_id, stored_emb = row
    stored_emb = np.asarray(stored_emb, dtype="float32").reshape(-1)

    if stored_emb.shape[0] != q_emb.shape[0]:
        raise EmbMiss

    dist = float(np.linalg.norm(stored_emb - q_emb))
    print(dist)
    match = dist <= THRESHOLD_DEFAULT
    if not match:
        raise NoVerificationExc

    pin_obj = await FacePinDao.get_by_emb_id(emb_id)
    if pin_obj:
        return JSONResponse(
            status_code=status.HTTP_202_ACCEPTED,
            content={
                "requires_pin": True,
                "pin_verify_url": "/face/verify-pin",
                "user_id": user.id,
                "emb_id": emb_id,
                "message": "Требуется ввод PIN" }
        )
    data_to_tokens = {"sub": str(user.id)}
    access_token = JwtController.create_token(data=data_to_tokens, token_type="access")
    refresh_token = JwtController.create_token(data=data_to_tokens, token_type="refresh")

    response.set_cookie(settings.ACCESS_TOKEN, access_token, httponly=True)
    response.set_cookie(settings.REFRESH_TOKEN, refresh_token, httponly=True)
    return TokenInfo(efficore_token=access_token, refresh_token=refresh_token)


@router.post("/verify-pin", response_model=TokenInfo)
async def verify_pin_and_issue_tokens(
    response: Response,
    user_id: int = Form(...),
    pin: str = Form(...),
):
    row = await FaceDao.get_by_id(user_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Эмбеддинг для пользователя не найден")

    emb_id = row[0]
    pin_obj = await FacePinDao.get_by_emb_id(emb_id)
    if not pin_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PIN не найден")

    if not FacePinDao.verify_pin(pin_obj.hashed_pin, pin):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный PIN")


    data_to_tokens = {"sub": str(user_id)}
    access_token = JwtController.create_token(data=data_to_tokens, token_type="access")
    refresh_token = JwtController.create_token(data=data_to_tokens, token_type="refresh")

    response.set_cookie(settings.ACCESS_TOKEN, access_token, httponly=True)
    response.set_cookie(settings.REFRESH_TOKEN, refresh_token, httponly=True)
    return TokenInfo(efficore_token=access_token, refresh_token=refresh_token)



@router.delete("/delete")
async def delete_face(current_user = Depends(get_current_user_to_access)):
    user_id = current_user.id
    if user_id is None:
        raise NoGivenToken

    deleted = await FaceDao.delete(user_id)

    if deleted is False:
        raise NoEmbForUser
    return {"deleted": True}


@router.put("/put")
async def add_face_for_current_user(
    file: UploadFile = File(...),
    meta: str | None = Form(None),
    model = Depends(get_model),
    current_user = Depends(get_current_user_to_access),
):
    user_id = current_user.id
    if user_id is None:
        raise NoGivenToken

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
        emb = await compute_embedding_async(model, pil, transform=eval_transform)
    except Exception as exc:
        HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ошбика вычисления эмбеддинга: {exc}")

    emb = np.asarray(emb, dtype="float32").reshape(-1)
    if emb.size == 0 or not np.isfinite(emb).all():
        raise InvalidEmb

    try:
        emb_id, obj = await FaceDao.create_or_update(user_id=user_id, emb=emb, meta=meta)
    except Exception:
        raise CantSaveEmb

    return {"ok": True, "embedding_id": emb_id}


@router.get('/pin')
async def get_pin(current_user = Depends(get_current_user_to_access)):
    user_id = current_user.id
    if user_id is None:
        raise NoGivenToken
    row = await FaceDao.get_by_id(user_id)
    if not row:
        raise NoEmbForUser
    emb_id = row[0]
    pin = await FacePinDao.get_by_emb_id(emb_id)
    if not pin:
        return {"has_pin": False, "pin_id": None}
    return {"has_pin": True, "pin_id": pin.id}

@router.post("/pin/create")
async def create_pin(pin: str = Form(...), current_user = Depends(get_current_user_to_access)):
    user_id = current_user.id
    if user_id is None:
        raise NoGivenToken
    row = await FaceDao.get_by_id(user_id)

    if not row:
        raise NoEmbForUser
    emb_id = row[0]
    new_obj = await FacePinDao.add_one(emb_id=emb_id, pin=pin)
    if not new_obj:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                        detail="PIN уже существует")
    return {"ok": True, "pin_id": new_obj.id, "created": True}


@router.delete("/pin")
async def delete_pin(current_user = Depends(get_current_user_to_access)):
    user_id = current_user.id
    if user_id is None:
        raise NoGivenToken
    row = await FaceDao.get_by_id(user_id)
    if not row:
        raise NoEmbForUser
    emb_id = row[0]
    pin_obj = await FacePinDao.get_by_emb_id(emb_id)
    if not pin_obj:
        raise NoEmbForUser
    deleted = await FacePinDao.delete_by_id(pin_obj.id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                        detail="Не удалось удалить PIN")
    return {"ok": True, "deleted": True}