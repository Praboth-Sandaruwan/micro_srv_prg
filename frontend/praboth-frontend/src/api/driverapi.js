
import api from './axiosInstance';

export async function login(username, password) {
    const response = await api.post('/auth/login', new URLSearchParams({ username, password }));
    return response.data;
}

export async function register(data) {
    const response = await api.post('/auth/register', data);
    return response.data;
}

export async function fetchDrivers() {
    const response = await api.get('/drivers');
    return response.data;
  }

