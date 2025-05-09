import axios from "axios";

// Create axios instances for each service
const cartClient = axios.create({
  baseURL: "http://localhost:5002/api",
  timeout: 5000,
});

const orderClient = axios.create({
  baseURL: "http://localhost:5001/api",
  timeout: 5000,
});

const paymentClient = axios.create({
  baseURL: "http://localhost:5003/api",
  timeout: 5000,
});

const restaurantClient = axios.create({
  baseURL: "http://localhost:5004/api",
  timeout: 5000,
});

// Add request interceptor to add auth token
const addAuthToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;

    // Check if user is admin and add the special header for dev mode
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData && userData.role === "admin") {
        config.headers["x-admin-auth"] = "true";
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }
  return config;
};

// Add response interceptor for error handling
const handleError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error("API Error:", error.response.data);
    return Promise.reject(error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    console.error("Network Error:", error.request);
    return Promise.reject({
      message: "Network error. Please check your connection.",
    });
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error("Error:", error.message);
    return Promise.reject({ message: error.message });
  }
};

cartClient.interceptors.request.use(addAuthToken);
orderClient.interceptors.request.use(addAuthToken);
paymentClient.interceptors.request.use(addAuthToken);
restaurantClient.interceptors.request.use(addAuthToken);

cartClient.interceptors.response.use((response) => response, handleError);
orderClient.interceptors.response.use((response) => response, handleError);
paymentClient.interceptors.response.use((response) => response, handleError);
restaurantClient.interceptors.response.use((response) => response, handleError);

// Cart API functions
export const cartApi = {
  getCart: (userId) => cartClient.get(`/cart/${userId}`),
  addToCart: (data) => cartClient.post("/cart/add", data),
  updateItemQuantity: (userId, itemId, quantity) =>
    cartClient.put(`/cart/${userId}/${itemId}`, { quantity }),
  removeItem: (userId, itemId) =>
    cartClient.delete(`/cart/${userId}/${itemId}`),
  clearCart: (userId) => cartClient.delete(`/cart/${userId}`),
};

// Order API functions
export const orderApi = {
  createOrder: (data) => orderClient.post("/orders", data),
  getOrders: (userId) => orderClient.get(`/orders/user/${userId}`),
  getOrder: (orderId) => orderClient.get(`/orders/${orderId}`),
  trackOrder: (orderId) => orderClient.get(`/orders/${orderId}/track`),
  updateOrderStatus: (orderId, status) =>
    orderClient.patch(`/orders/${orderId}/status`, { status }),
  getRestaurantOrders: (restaurantId) =>
    orderClient.get(`/orders/restaurant/${restaurantId}`),
  assignDriver: (orderId, driverId) =>
    orderClient.post(`/orders/${orderId}/assign-driver`, { driverId }),
  // Admin-specific endpoints
  getAllOrders: (filters = {}) =>
    orderClient.get("/orders/admin/all", { params: filters }),
  updateOrder: (orderId, orderData) =>
    orderClient.put(`/orders/${orderId}`, orderData),
  deleteOrder: (orderId) => orderClient.delete(`/orders/${orderId}`),
  cancelOrder: (orderId, cancellationReason) =>
    orderClient.post(`/orders/${orderId}/cancel`, { cancellationReason }),
  // Alternative order cancellation method (doesn't require auth token validation)
  userCancelOrder: (orderId, userId, cancellationReason) =>
    orderClient.post(`/orders/${orderId}/user-cancel`, {
      userId,
      cancellationReason,
    }),
};

// Payment API functions
export const paymentApi = {
  createPaymentIntent: (data) => paymentClient.post("/payments/initiate", data),
  getPaymentStatus: (orderId) =>
    paymentClient.get(`/payments/order/${orderId}`),
};

// Restaurant API functions
export const restaurantApi = {
  // Restaurant endpoints
  getAllRestaurants: (filters = {}) =>
    restaurantClient.get("/restaurants", { params: filters }),
  getRestaurantById: (restaurantId) =>
    restaurantClient.get(`/restaurants/${restaurantId}`),
  createRestaurant: (restaurantData) =>
    restaurantClient.post("/restaurants", restaurantData),
  updateRestaurant: (restaurantId, restaurantData) =>
    restaurantClient.put(`/restaurants/${restaurantId}`, restaurantData),
  deleteRestaurant: (restaurantId) =>
    restaurantClient.delete(`/restaurants/${restaurantId}`),
  getMyRestaurants: () => restaurantClient.get("/restaurants/owner/me"),

  // Menu endpoints
  getMenuItems: (restaurantId, category) =>
    restaurantClient.get(`/restaurants/${restaurantId}/menu`, {
      params: { category },
    }),
  getMenuItem: (restaurantId, menuItemId) =>
    restaurantClient.get(`/restaurants/${restaurantId}/menu/${menuItemId}`),
  addMenuItem: (restaurantId, menuItemData) =>
    restaurantClient.post(`/restaurants/${restaurantId}/menu`, menuItemData),
  updateMenuItem: (restaurantId, menuItemId, menuItemData) =>
    restaurantClient.put(
      `/restaurants/${restaurantId}/menu/${menuItemId}`,
      menuItemData
    ),
  deleteMenuItem: (restaurantId, menuItemId) =>
    restaurantClient.delete(`/restaurants/${restaurantId}/menu/${menuItemId}`),
};

// Export all APIs
export default {
  cart: cartApi,
  order: orderApi,
  payment: paymentApi,
  restaurant: restaurantApi,
};
