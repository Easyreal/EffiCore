import torch.nn as nn
import torchvision.models as models

from app.config import settings

ResNet18_Weights = models.ResNet18_Weights

EMBED_DIM = settings.EMBED_DIM

class EmbeddingNet(nn.Module):
    def __init__(self, embedding_dim=EMBED_DIM, pretrained=True):
        super().__init__()
        if pretrained and ResNet18_Weights is not None:
            back = models.resnet18(weights=ResNet18_Weights.DEFAULT)
        elif pretrained and ResNet18_Weights is None:
            back = models.resnet18(pretrained=True)
        else:
            back = models.resnet18(weights=None)

        modules = list(back.children())[:-1]
        self.backbone = nn.Sequential(*modules)
        self.fc = nn.Linear(back.fc.in_features, embedding_dim)
        self.bn = nn.BatchNorm1d(embedding_dim)

    def forward(self, x):
        x = self.backbone(x)
        x = x.flatten(1)
        x = self.fc(x)
        x = self.bn(x)
        x = nn.functional.normalize(x, p=2, dim=1)
        return x

class SiameseNet(nn.Module):
    def __init__(self, embedding_net):
        super().__init__()
        self.embedding_net = embedding_net

    def forward(self, x1, x2):
        return self.embedding_net(x1), self.embedding_net(x2)

    def embedding(self, x):
        return self.embedding_net(x)

