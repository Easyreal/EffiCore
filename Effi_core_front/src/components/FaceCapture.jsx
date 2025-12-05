import React, { useRef, useState, useEffect } from 'react';

const FaceCapture = ({ initialFile = null, onChangeFile }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(initialFile ? URL.createObjectURL(initialFile) : null);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    };
  }, [stream, filePreviewUrl]);

  const startCamera = async () => {
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      console.error('Camera error', err);
      setError('Не удалось получить доступ к камере');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  const capturePhoto = async () => {
    setError(null);
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState < 2) {
      await new Promise(resolve => {
        const onLoaded = () => {
          video.removeEventListener('loadedmetadata', onLoaded);
          resolve();
        };
        video.addEventListener('loadedmetadata', onLoaded);
      });
    }

    if (!video.videoWidth || !video.videoHeight) {
      await new Promise(r => setTimeout(r, 50));
    }

    const w = video.videoWidth || video.clientWidth || 640;
    const h = video.videoHeight || video.clientHeight || 480;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    if (!blob) {
      setError('Не удалось создать изображение');
      return;
    }

    const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });

    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    const url = URL.createObjectURL(file);
    setFilePreviewUrl(url);

    onChangeFile?.(file);

  };

  const clearPhoto = () => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    onChangeFile?.(null);
    setError(null);
  };

  return (
    <div className="face-capture" style={{ marginTop: 12 }}>
      <div style={{ marginBottom: 12 }}>
        <button
          type="button"
          onClick={startCamera}
          disabled={!!stream}
          className="btn-secondary"
        >
          Открыть камеру
        </button>
        <button
          type="button"
          onClick={stopCamera}
          disabled={!stream}
          className="btn-secondary"
          style={{ marginLeft: 8 }}
        >
          Закрыть камеру
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: 400, height: 240, background: '#000' }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      <div style={{ marginTop: 12 }}>
        <button
          type="button"
          onClick={capturePhoto}
          disabled={!stream || loading}
          className="btn-primary"
        >
          {loading ? 'Снимаю...' : 'Сделать снимок'}
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        {filePreviewUrl ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src={filePreviewUrl}
              alt="preview"
              style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 4, border: '1px solid #ddd' }}
            />
            <div>
              <div style={{ marginBottom: 8 }}>Фото готово</div>
              <div>
                <button type="button" onClick={clearPhoto} className="btn-secondary">Сделать заново</button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: '#666' }}>Фото не сделано</div>
        )}
      </div>

      {error && <div className="error-message" style={{ marginTop: 8 }}>{error}</div>}
    </div>
  );
};

export default FaceCapture;
