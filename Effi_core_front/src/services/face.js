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

  for (const pair of form.entries()) {
    console.log('form entry:', pair[0], pair[1]);
  }

  const resp = await faceClient.post('/face/verify', form, {
    withCredentials: true,
  });
  if (resp.data.efficore_token) {
        localStorage.setItem('access_token', response.data.efficore_token);
      }
  if (resp.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }
  return resp.data;
}


export async function registerAndAddFace(userData, file, config = {}, onUploadProgress) {
  const regResult = await apiService.register(userData);
  const userId = regResult?.id || regResult?.user?.id;
  if (!userId) throw new Error('User ID not returned from register');

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

export async function uploadForCurrentUser(file, meta = null, onUploadProgress) {
  const form = new FormData();
  form.append('file', file, file.name || 'capture.jpg');
  if (meta) form.append('meta', meta);

  const resp = await apiService.client.put('/face/put', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
  return resp.data;
}

export async function deleteForCurrentUser() {
  const resp = await apiService.client.delete('/face/delete');
  return resp.data;
}
