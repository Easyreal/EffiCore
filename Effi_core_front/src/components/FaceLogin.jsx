import React, { useRef, useState, useEffect } from "react";
import { verifyByFace } from '../services/face.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const FaceLogin = ({ email }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  const { fetchCurrentUser } = useAuth();

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [stream]);

  const startCamera = async () => {
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      setError("Не удалось получить доступ к камере");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  const captureAndSend = async () => {
    setError(null);
    if (!videoRef.current) return;
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

      const result = await verifyByFace(email, blob);


      if (result?.efficore_token) localStorage.setItem('access_token', result.efficore_token);
      if (result?.refresh_token) localStorage.setItem('refresh_token', result.refresh_token);


      if (typeof fetchCurrentUser === 'function') {
        await fetchCurrentUser();
      }

      navigate('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || "Ошибка при верификации";
      setError(msg);
    } finally {
      setLoading(false);
      stopCamera();
    }
  };

  return (
    <div className="face-login">
      <div style={{ marginBottom: 12 }}>
        <button type="button" onClick={startCamera} disabled={!!stream}>Открыть камеру</button>
        <button type="button" onClick={stopCamera} disabled={!stream}>Закрыть камеру</button>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <video ref={videoRef} autoPlay playsInline muted style={{ width: 400, height: 240, background: "#000" }} />
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      <div style={{ marginTop: 12 }}>
        <button type="button" onClick={captureAndSend} disabled={!stream || loading || !email} className="btn-primary">
          {loading ? "Проверка..." : "Войти по фото"}
        </button>
      </div>

      {error && <div className="error-message" style={{ marginTop: 8 }}>{error}</div>}
    </div>
  );
};

export default FaceLogin;
