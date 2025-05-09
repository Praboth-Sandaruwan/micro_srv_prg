import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', 
  });

export const getAllRestaurants = async () => {
    try {
        const response = await api.get('/restaurants');
        return response.data;
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        throw error;
    }
}

export const getRestaurantById = async (restaurantId) => {
    try {
        const response = await api.get(`/restaurants/${restaurantId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        throw error;
    }
}

export const getRestaurentLocation = async (restaurantId) => {
    try {
        const response = await api.get(`/restaurants/${restaurantId}`);
        const location = response.data?.location;
        if (!location) {
            throw new Error('Location not found for the restaurant');
        }
        return location;
    } catch (error) {
        console.error('Error fetching restaurant location:', error);
        throw error;
    }
}

export const getUserById = async (userId) => {
    try {
        const response = await api.get(`/users/dd/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}

export const getUserLocation = async (userId) => {
    try {
        const response = await api.get(`/users/dd/${userId}`);
        const location = response.data?.location;
        if (!location) {
            throw new Error('Location not found for the user');
        }
        return location;
    } catch (error) {
        console.error('Error fetching user location:', error);
        throw error;
    }
}