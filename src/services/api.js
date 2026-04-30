import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://comut-backend.onrender.com/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, pseudo, password) => api.post('/auth/register', { email, pseudo, password }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email })
};

export const postsAPI = {
  getPosts: (groupId, sort, type) => api.get('/posts', { params: { groupId, sort, type } }),
  getShorts: (groupId) => api.get('/posts/shorts', { params: { groupId } }),
  toggleLike: (postId) => api.post(`/posts/${postId}/like`),
  createPost: (formData) => api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
};

export const groupsAPI = {
  create: (name) => api.post('/groups', { name }),
  join: (code) => api.post('/groups/join', { code }),
  getMyGroups: () => api.get('/groups'),
  getGroup: (id) => api.get(`/groups/${id}`)
};

export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updatePassword: (currentPassword, newPassword) => api.put('/users/password', { currentPassword, newPassword }),
  getFavorites: () => api.get('/users/favorites'),
  toggleFavorite: (postId) => api.post(`/users/favorites/${postId}`)
};

export default api;
