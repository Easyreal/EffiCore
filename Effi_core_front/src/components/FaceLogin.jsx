import React, { useRef, useState, useEffect } from "react";
import { apiService } from '../services/api.js';

const FaceLogin = ({ email, onSuccess, onRequiresPin, onError }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [stream]);

  const startCamera = async () => {
    setLocalError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      setLocalError("Не удалось получить доступ к камере");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  const captureAndSend = async () => {
    setLocalError(null);
    if (!videoRef.current) return;
    if (!email) {
      const msg = 'Введите email перед отправкой фото';
      setLocalError(msg);
      onError?.(msg);
      return;
    }

    setLoading(true);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const w = video.videoWidth || 640;
      const h = video.videoHeight || 480;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, w, h);

      const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.9));
      if (!blob) throw new Error("Не удалось создать изображение");

      const form = new FormData();
      form.append('email', email);
      form.append('file', blob, 'capture.jpg');

      const resp = await apiService.client.post('/face/verify', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      const data = resp.data || {};

      if (data.requires_pin) {
        onRequiresPin?.({ user_id: data.user_id, emb_id: data.emb_id });
        return;
      }

      if (data.efficore_token || data.refresh_token) {
        localStorage.setItem('access_token', data.efficore_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        onSuccess?.(data);
        return;
      }

      onSuccess?.(data);
    } catch (err) {
      console.error('Face verify error', err);
      const msg = err?.response?.data?.detail || err?.response?.data || err?.message || 'Ошибка при верификации лица';
      setLocalError(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
      stopCamera();
    }
  };

  return (
    <div className="face-login">
      <div style={{ marginBottom: 12 }}>
        <button type="button" onClick={startCamera} disabled={!!stream || loading} className="btn-secondary">
          Открыть камеру
        </button>
        <button type="button" onClick={stopCamera} disabled={!stream || loading} className="btn-secondary" style={{ marginLeft: 8 }}>
          Закрыть камеру
        </button>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <video ref={videoRef} autoPlay playsInline muted style={{ width: 400, height: 240, background: "#000" }} />
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      <div style={{ marginTop: 12 }}>
        <button
          type="button"
          onClick={captureAndSend}
          disabled={!stream || loading}
          className="btn-primary"
        >
          {loading ? "Проверка..." : "Войти по логин/фото"}
        </button>
      </div>

      {(localError) && <div className="error-message" style={{ marginTop: 8 }}>{localError}</div>}
    </div>
  );
};

export default FaceLogin;
