import React, { createContext, useState, useEffect, useContext } from "react";
import {
  createNotification,
  createUserNotification,
} from "../api/notificationapi";
import { updateOrder } from "../api/ordersapi";
import { getRestaurantById, getUserById } from "../api/usermgapi"; // Adjust path if needed

const DeliveryContext = createContext(null);

export const DeliveryProvider = ({ children }) => {
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedDelivery = localStorage.getItem("currentDelivery");
    if (savedDelivery) {
      const parsed = JSON.parse(savedDelivery);
      parsed.history = parsed.history.map((h) => ({
        ...h,
        timestamp: new Date(h.timestamp),
      }));
      setCurrentDelivery(parsed);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (currentDelivery) {
      const serializableDelivery = {
        ...currentDelivery,
        history: currentDelivery.history.map((h) => ({
          ...h,
          timestamp: h.timestamp.toISOString(),
        })),
      };
      localStorage.setItem(
        "currentDelivery",
        JSON.stringify(serializableDelivery)
      );
    } else {
      localStorage.removeItem("currentDelivery");
    }
  }, [currentDelivery]);

  const acceptDelivery = async (delivery) => {
    try {
      const restaurant = await getRestaurantById(delivery.restaurantId);
      const customer = await getUserById(delivery.userId);

      if (!restaurant || !customer) {
        console.error("Restaurant or customer not found");
        return;
      }

      const deliveryData = {
        status: "CONFIRMED",
        history: [{ status: "CONFIRMED", timestamp: new Date() }],
        restaurantLocation: {
          lat: restaurant.location.latitude,
          lng: restaurant.location.longitude,
        },
        deliveryAddress: {
          lat: customer.location.latitude,
          lng: customer.location.longitude,
        },
        restaurantId: restaurant._id,
        customerId: customer._id,
        deliverydriverId: localStorage.getItem("wsDriverId"),
      };

      const newDelivery = await updateOrder(delivery._id, deliveryData);
      newDelivery.history = newDelivery.history.map((h) => ({
        ...h,
        timestamp: new Date(h.timestamp),
      }));

      await createUserNotification(newDelivery).catch((err) => {
        console.error("Failed to create user notification:", err);
      });

      setCurrentDelivery(newDelivery);
      localStorage.setItem(
        "currentDelivery",
        JSON.stringify(newDelivery)
      );
    } catch (err) {
      console.error("acceptDelivery error:", err);
    }
  };

  const updateDeliveryStatus = async (newStatus) => {
    if (!["PICKUP", "OUTFORDELIVERY", "COMPLETED"].includes(newStatus)) return;
    if (!currentDelivery) return;

    const newHistory = [
      ...currentDelivery.history,
      { status: newStatus, timestamp: new Date() },
    ];

    const updatedDelivery = {
      ...currentDelivery,
      status: newStatus,
      history: newHistory,
    };

    try {
      await updateOrder(currentDelivery._id, {
        status: newStatus,
        history: newHistory,
      });
      setCurrentDelivery(updatedDelivery);
      await createUserNotification(updatedDelivery);
    } catch (err) {
      console.error("Failed to update delivery status or notify user:", err);
    }
  };

  const completeDelivery = async () => {
    if (!currentDelivery) return;
    const driver = localStorage.getItem("wsDriverId");
    const orderId = currentDelivery._id;

    await updateDeliveryStatus("COMPLETED");

    setCurrentDelivery(null);

    const notificationData = {
      user: driver,
      user_role: "delivery_driver",
      order: orderId,
      type: "order_complete",
      message: "You have completed the delivery",
    };

    try {
      await createNotification(notificationData);
    } catch (err) {
      console.error("Failed to create driver notification:", err);
    }

    localStorage.removeItem("currentDelivery");
  };

  return (
    <DeliveryContext.Provider
      value={{
        currentDelivery,
        acceptDelivery,
        updateDeliveryStatus,
        completeDelivery,
        loading,
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => useContext(DeliveryContext);
