import React, { createContext, useState, useEffect, useContext } from "react";
import {
  createNotification,
  createUserNotification,
} from "../api/notificationapi";
import { updateOrder } from "../api/ordersapi";

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
    setLoading(false); //FINISH LOADING AFTER INIT
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
      const [restaurantsRes, usersRes] = await Promise.all([
        fetch("/db/restaurents.json"),
        fetch("/db/users.json"),
      ]);

      if (!restaurantsRes.ok || !usersRes.ok)
        throw new Error("Failed to fetch restaurants or users");

      const [restaurants, users] = await Promise.all([
        restaurantsRes.json(),
        usersRes.json(),
      ]);

      const restaurant = restaurants.find(
        (r) => r._id === delivery.restaurantId
      );
      const customer = users.find((u) => u._id === delivery.userId);

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
      localStorage.setItem("currentDelivery", JSON.stringify(newDelivery));
    } catch (err) {
      console.error("acceptDelivery error:", err);
    }
  };

  const updateDeliveryStatus = async (newStatus) => {
    if (!["PICKUP", "OUTFORDELIVERY", "COMPLETED"].includes(newStatus)) return;
    setCurrentDelivery((prev) => {
      if (!prev) return prev;
      const newHistory = [
        ...prev.history,
        { status: newStatus, timestamp: new Date() },
      ];
      updateOrder(prev._id, {
        status: newStatus,
        history: newHistory,
      }).catch((err) => {
        console.error("Failed to update order status:", err);
      });
      createUserNotification({
        ...prev,
        status: newStatus,
        history: newHistory,
      }).catch((err) => {
        console.error("Failed to create user notification:", err);
      });
      return {
        ...prev,
        status: newStatus,
        history: newHistory,
      };
    });
  };

  const completeDelivery = async () => {
    if (!currentDelivery) return;
    const driver = localStorage.getItem("wsDriverId");
    const orderId = currentDelivery._id;

    const newDelivery = await updateDeliveryStatus("COMPLETED");
    localStorage.removeItem("currentDelivery");
    setCurrentDelivery(null);

    const notificationData = {
      user: driver,
      user_role: "delivery_driver",
      order: orderId,
      type: "order_complete",
      message: "You have completed the delivery ",
    };
    await createNotification(notificationData);
    await createUserNotification(newDelivery).catch((err) => {
      console.error("Failed to create user notification:", err);
    });
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
