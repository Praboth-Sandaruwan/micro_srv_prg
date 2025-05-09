import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8014/notification/ctrl/api/v1",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// const notificationData = {
//   user: driver,  // id
//   user_role: "delivery_driver",
//   order: orderId,
//   type: "order_complete",
//   message: "You have completed the delivery ",
// };

export async function createNotification(data) {
  const response = await api.post("/create", data);
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

export async function createUserNotification(order) {
  if (!order) {
    throw new Error("Missing required parameters: order.");
  }

  const status = order.status;
  if (!status) {
    throw new Error("Missing order status.");
  }

  let message;
  switch (status) {
    case "CONFIRMED":
      message = `Your order has been accepted by the delivery driver with id : ${order.deliverydriverId}.`;
      break;
    case "OUTFORDELIVERY":
      message = `Your order has been picked up by the delivery driver from the restaurant and is out for delivery.`;
      break;
    case "COMPLETED":
      message = `Your order has been delivered successfully.`;
      break;
    default:
      throw new Error("Invalid notification type.");
  }

  const data = {
    user: order.userId,
    user_role: "customer",
    order: order._id,
    type: "order_user",
    message: message,
  };

  const response = await api.post("/create", data);
  return response.data;
}

