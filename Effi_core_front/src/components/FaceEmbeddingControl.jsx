import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api.js';
import FaceCapture from './FaceCapture.jsx';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function FFaceEmbeddingControl() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exists, setExists] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const fetchStatus = async () => {
    try {
      const resp = await apiService.client.get('/face/status');
      setExists(Boolean(resp.data?.emb));
    } catch (err) {
      console.error('Failed to fetch face status', err);
      setExists(null);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const onCaptureFile = (capturedFile) => {
    setError(null);
    if (!capturedFile) {
      setFile(null);
      return;
    }
    if (capturedFile.size > MAX_FILE_SIZE) {
      setError(`Файл слишком большой. Максимум ${Math.round(MAX_FILE_SIZE / 1024 / 1024)} MB`);
      return;
    }
    setFile(capturedFile);
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const form = new FormData();
      form.append('file', file, file.name || 'capture.jpg');

      const resp = await apiService.client.put('/face/put', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (ev) => {
          if (ev.lengthComputable) {
            setProgress(Math.round((ev.loaded * 100) / ev.total));
          }
        },
      });

      console.log('Upload response', resp.data);
      setFile(null);
      await fetchStatus();
    } catch (err) {
      console.error(err);
      const serverDetail = err?.response?.data?.detail;
      setError(
        typeof serverDetail === 'string'
          ? serverDetail
          : Array.isArray(serverDetail) && serverDetail.length
          ? serverDetail[0]?.msg || JSON.stringify(serverDetail)
          : err?.response?.data || err?.message || 'Upload failed'
      );
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const remove = async () => {
    if (!confirm('Удалить эмбеддинг?')) return;
    setDeleting(true);
    setError(null);
    try {
      const resp = await apiService.client.delete('/face/delete');
      console.log('Delete response', resp.data);
      setFile(null);
      await fetchStatus();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || err?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="face-embedding-control" style={{ marginTop: 20 }}>
      <h3>Эмбеддинг лица</h3>

      <div style={{ marginBottom: 12 }}>
        {exists === null ? (
          <div style={{ color: '#666' }}>Статус эмбеддинга неизвестен</div>
        ) : exists ? (
          <div>Эмбеддинг установлен</div>
        ) : (
          <div style={{ color: '#666' }}>Эмбеддинг не установлен</div>
        )}
      </div>

      <FaceCapture initialFile={file} onChangeFile={onCaptureFile} />

      <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={upload}
          disabled={!file || uploading}
          className="btn-primary"
        >
          {uploading ? `Загрузка ${progress}%` : 'Добавить / Заменить'}
        </button>

        <button
          onClick={remove}
          disabled={deleting}
          className="btn-danger"
        >
          {deleting ? 'Удаление...' : 'Удалить'}
        </button>
      </div>

      {file && (
        <div style={{ marginTop: 8, color: '#333' }}>
          Выбран файл: <strong>{file.name}</strong> ({Math.round(file.size / 1024)} KB)
        </div>
      )}

      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
}
