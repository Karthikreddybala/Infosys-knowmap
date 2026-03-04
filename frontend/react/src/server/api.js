import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
export const Loginapi =async (username, password) => {
  try {
    const response = await api.post('/login', {username , password });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
export const Registerapi = async (username, password) => {
  try {
    const response = await api.post('/register', { username, password });
    return response.data;
    } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};
