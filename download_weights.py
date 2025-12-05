import requests
import os


def download_model():
    url = "https://drive.google.com/uc?export=download&id=ВАШ_ID_ФАЙЛА"
    path = "Effi_Core_back/weights/best_checkpoint.pth"

    if not os.path.exists(path):
        response = requests.get(url, stream=True)
        with open(path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print("Download complete!")
    return path

