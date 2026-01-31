from PIL import Image
from fastapi.concurrency import run_in_threadpool
import torchvision.transforms as T
from functools import lru_cache
from .model_impl import EmbeddingNet, SiameseNet
from app.config import settings
import torch
import numpy as np
from torch.serialization import safe_globals

IMG_SIZE = settings.IMG_SIZE
MODEL_WEIGHTS_PATH = settings.MODEL_WEIGHTS_PATH
DEVICE = settings.get_device()
EMBED_DIM = settings.EMBED_DIM
eval_transform = T.Compose([
    T.Resize((IMG_SIZE, IMG_SIZE)),
    T.ToTensor(),
    T.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225])
])


def load_model(weights_path=MODEL_WEIGHTS_PATH, device=DEVICE):
    emb = EmbeddingNet(embedding_dim=EMBED_DIM, pretrained=False)
    model = SiameseNet(emb)

    with safe_globals([np._core.multiarray.scalar]):
        ckpt = torch.load(weights_path, map_location="cpu", weights_only=False)
    state = ckpt.get("model_state_dict", ckpt) if isinstance(ckpt, dict) else ckpt
    model.load_state_dict(state)
    model.to(device)
    model.eval()
    return model

@lru_cache(maxsize=1)
def get_model():
    return load_model()


def _compute_embedding_sync(model, pil_image: Image.Image, transform=eval_transform, device=DEVICE):
    x = transform(pil_image).unsqueeze(0).to(device)

    try:
        x = x.to(memory_format=torch.channels_last)
    except Exception:
        pass
    with torch.no_grad():
        emb = model.embedding_net(x) if hasattr(model, "embedding_net") else model(x)
        emb = emb.detach().cpu().squeeze(0).to(dtype=torch.float32).numpy()
    return emb

async def compute_embedding_async(model, pil_image: Image.Image, transform=eval_transform, device=DEVICE):
    return await run_in_threadpool(_compute_embedding_sync, model, pil_image, transform, device)
