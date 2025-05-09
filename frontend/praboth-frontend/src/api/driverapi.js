import api from "./axiosInstance";

export async function login(username, password) {
  const response = await api.post(
    "/auth/login",
    new URLSearchParams({ username, password })
  );
  return response.data;
}

export async function register(data) {
  const response = await api.post("/auth/register", data);
  return response.data;
}

export async function fetchDrivers() {
  const response = await api.get("/drivers");
  return response.data;
}

export async function fetchDriverById(driverId) {
  const response = await api.get(`/drivers/${driverId}`);
  return response.data;
}

export async function updateDriver(driverId, data) {
  const response = await api.put(`/drivers/${driverId}`, data);
  return response.data;
}

export async function deleteDriver(driverId) {
  const response = await api.delete(`/drivers/${driverId}`);
  return response.data;
}

export async function fetchConnectedDrivers() {
  const response = await api.get("ws/drivers/cdrivers");
  return response;
}

// user api helpers

export async function rateDriver(driverId, data) {
  //data = { rating: 4.5 };
  const response = await api.put(`/drivers/rat/${driverId}`, data);
  return response.data;
}