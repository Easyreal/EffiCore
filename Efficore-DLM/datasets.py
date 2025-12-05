from torch.utils.data import Dataset
from PIL import Image
import torchvision.transforms as T
import torch

class LFWDatasetPairs(Dataset):
    def __init__(self, pairs, transform=None):
        self.pairs = pairs
        self.transform = transform or T.ToTensor()
    def __len__(self):
        return len(self.pairs)
    def __getitem__(self, idx):
        p1,p2,label = self.pairs[idx]
        img1 = Image.open(p1).convert("RGB")
        img2 = Image.open(p2).convert("RGB")
        if self.transform:
            img1 = self.transform(img1); img2 = self.transform(img2)
        return img1, img2, torch.tensor(label, dtype=torch.float32)
