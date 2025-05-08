import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8014/notification/ctrl/api/v1',
});


api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export async function createNotification(data) {
  const response = await api.post('/create', data);
  return response.data;
}

export async function fetchNotificationsByUser(userId) {
  const response = await api.get(`/get_all/${userId}`);
  return response.data;
}

export async function fetchNotificationById(id) {
  const response = await api.get(`/get/${id}`);
  return response.data;
}

export async function updateNotification(id, data) {
  const response = await api.put(`/update/${id}`, data);
  return response.data;
}

export async function readnotification(id) {
  const response = await api.put(`/update/${id}`, { status: true });
  return response.data;
}