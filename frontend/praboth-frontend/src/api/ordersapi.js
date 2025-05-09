import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8011/orders/api/v1', 
  });


export const getAllOrders = async () => {
    try {
        const response = await api.get('/orders');
        return response.data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
}

export const getPendingOrders = async () => {
    try {
        const response = await api.get('/orders');
        return response.data.filter(order => order.status === "PENDING" || order.status === "CONFIRMED" || order.status === "OUTFORDELIVERY");
    } catch (error) {
        console.error('Error fetching completed orders:', error);
        throw error;
    }
}

export const getMyOrdersDrv = async (id) => {
    try {
        const response = await api.get('/orders');
        return response.data.filter(order => order.deliveryDriverId === id);
    } catch (error) {
        console.error('Error fetching completed orders:', error);
        throw error;
    }
}


export const getOrderById = async (orderId) => {
    try {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching order:', error);
        throw error;
    }
}

export const createOrder = async (orderData) => {
    try {
        const response = await api.post('/orders', orderData);
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

export const updateOrder = async (orderId, orderData) => {
    try {
        const response = await api.put(`/orders/${orderId}`, orderData);
        return response.data;
    } catch (error) {
        console.error('Error updating order:', error);
        throw error;
    }
}

export const deleteOrder = async (orderId) => {
    try {
        const response = await api.delete(`/orders/${orderId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting order:', error);
        throw error;
    }
}

// User api helpers

export const getUserOrders = async (userId) => {
    try {
        const response = await api.get('/orders');
        return response.data.filter(order => order.userId === userId);
    } catch (error) {
        console.error('Error fetching completed orders:', error);
        throw error;
    }
}

export const getOutForDelOrders = async (userId) => {
    try {
        const response = await api.get('/orders');
        return response.data.filter(order => order.status === "OUTFORDELIVERY" && order.userId === userId);
    } catch (error) {
        console.error('Error fetching completed orders:', error);
        throw error;
    }
}

export const getCompletedOrders = async (userId) => {
    try {
        const response = await api.get('/orders');
        return response.data.filter(order => order.status === "COMPLETED" && order.userId === userId);
    } catch (error) {
        console.error('Error fetching completed orders:', error);
        throw error;
    }
}

export const getMyOrdersUsr = async (id) => {
    try {
        const response = await api.get('/orders');
        return response.data.filter(order => order.userId === id);
    } catch (error) {
        console.error('Error fetching completed orders:', error);
        throw error;
    }
}

