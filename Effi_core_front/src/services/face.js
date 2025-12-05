// src/services/face.js
import axios from 'axios';
const API_BASE_URL = '/api';
import { apiService } from './api.js';

const faceClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export async function verifyByFace(email, fileBlob) {
  const form = new FormData();
  form.append('email', email);
  form.append('file', fileBlob, 'capture.jpg');

  // DEBUG: логируем содержимое формы
  for (const pair of form.entries()) {
    console.log('form entry:', pair[0], pair[1]);
  }

  const resp = await faceClient.post('/face/verify', form, {
    withCredentials: true,
  });
  return resp.data;
}


export async function registerAndAddFace(userData, file, config = {}, onUploadProgress) {
  // 1. Регистрируем пользователя
  const regResult = await apiService.register(userData);
  const userId = regResult?.id || regResult?.user?.id;
  if (!userId) throw new Error('User ID not returned from register');

  // 2. Загружаем фото
  const form = new FormData();
  form.append('user_id', String(userId));
  form.append('file', file, file.name || 'capture.jpg');

  const resp = await faceClient.post('/face/create', form, {
    headers: {},
    onUploadProgress,
    ...config,
  });

  return { user: regResult, face: resp.data };
}