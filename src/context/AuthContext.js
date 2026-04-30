import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const API_URL = 'https://comut-backend.onrender.com/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadToken();
  }, []);

  async function loadToken() {
    try {
      const savedToken = await SecureStore.getItemAsync('token');
      if (savedToken) {
        const response = await axios.get(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${savedToken}` }
        });
        setUser(response.data);
        setToken(savedToken);
      }
    } catch (error) {
      await SecureStore.deleteItemAsync('token');
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    await SecureStore.setItemAsync('token', response.data.token);
    setUser(response.data.user);
    setToken(response.data.token);
    return response.data;
  }

  async function register(email, pseudo, password) {
    return await axios.post(`${API_URL}/auth/register`, { email, pseudo, password });
  }

  async function logout() {
    await SecureStore.deleteItemAsync('token');
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function getToken() {
  const { token } = useContext(AuthContext);
  return token;
}
