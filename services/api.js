import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://comut-backend.onrender.com/api';

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('comut_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.error || error.message || 'Erreur réseau';
    return Promise.reject(new Error(msg));
  }
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => api.post('/auth/reset-password', { token, password });
export const changePassword = (data) => api.post('/auth/change-password', data);

// Groups
export const createGroup = (name) => api.post('/groups/create', { name });
export const joinGroup = (code) => api.post('/groups/join', { code });
export const getMyGroup = () => api.get('/groups/me');
export const leaveGroup = () => api.post('/groups/leave');
export const promoteAdmin = (userId) => api.post(`/groups/promote/${userId}`);
export const demoteAdmin = (userId) => api.post(`/groups/demote/${userId}`);
export const kickMember = (userId) => api.post(`/groups/kick/${userId}`);
export const updateGroupSettings = (data) => api.patch('/groups/settings', data);

// Content
export const getContents = (params) => api.get('/content', { params });
export const getShorts = () => api.get('/content/shorts');
export const getFavorites = () => api.get('/content/favorites');
export const likeContent = (id) => api.post(`/content/${id}/like`);
export const favoriteContent = (id) => api.post(`/content/${id}/favorite`);
export const deleteContent = (id) => api.delete(`/content/${id}`);

// Comments
export const getComments = (contentId) => api.get(`/comments/${contentId}`);
export const addComment = (data) => api.post('/comments', data);
export const deleteComment = (id) => api.delete(`/comments/${id}`);
export const likeComment = (id) => api.post(`/comments/${id}/like`);

// Admin
export const adminGetUsers = () => api.get('/admin/users');
export const adminDeleteUser = (id) => api.delete(`/admin/users/${id}`);
export const adminChangePassword = (id, newPassword) => api.patch(`/admin/users/${id}/password`, { newPassword });
export const adminGetGroups = () => api.get('/admin/groups');
export const adminDeleteGroup = (id) => api.delete(`/admin/groups/${id}`);
export const adminGetStats = () => api.get('/admin/stats');

export default api;
