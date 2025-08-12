// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// แทรก token อัตโนมัติถ้ามี
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // เก็บหลัง login
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
