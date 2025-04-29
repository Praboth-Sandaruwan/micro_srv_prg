import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

const DeliveryContext = createContext(null);

export const DeliveryProvider = ({ children }) => {
  const [currentDelivery, setCurrentDelivery] = useState(() => {
    const saved = localStorage.getItem("currentDelivery");
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.history = parsed.history.map((h) => ({
        ...h,
        timestamp: new Date(h.timestamp),
      }));
      return parsed;
    }
    return null;
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (currentDelivery) {
      console.log("Saving current delivery to localStorage:", currentDelivery);
      const serializable = {
        ...currentDelivery,
        history: currentDelivery.history.map((h) => ({
          ...h,
          timestamp: h.timestamp.toISOString(),
        })),
      };
      localStorage.setItem("currentDelivery", JSON.stringify(serializable));
    } else {
      localStorage.removeItem("currentDelivery");
    }
  }, [currentDelivery]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (currentDelivery && window.location.pathname !== "/delivery" && token) {
      navigate("/delivery");
    }
  }, [currentDelivery, navigate]);

  const acceptDelivery = async (delivery) => {
    try {
      const [restaurantsRes, usersRes] = await Promise.all([
        fetch("/db/restaurents.json"),
        fetch("/db/users.json"),
      ]);

      if (!restaurantsRes.ok || !usersRes.ok)
        throw new Error("JSON fetch failed");

      const [restaurants, users] = await Promise.all([
        restaurantsRes.json(),
        usersRes.json(),
      ]);

      const restaurant = restaurants.find(
        (r) => r._id === delivery.restaurantId
      );
      const customer = users.find((u) => u._id === delivery.userId);

      if (!restaurant || !customer) {
        console.error("Restaurant or Customer not found");
        return;
      }

      console.log("Restaurant:", restaurant); ////// debug
      console.log("Customer:", customer);
      console.log("Delivery:", delivery);

      const newDelivery = {
        ...delivery,
        status: "PICKUP",
        history: [{ status: "PICKUP", timestamp: new Date() }],
        restaurantLocation: {
          lat: restaurant.location.latitude,
          lng: restaurant.location.longitude,
        },
        deliveryAddress: {
          lat: customer.location.latitude,
          lng: customer.location.longitude,
        },
      };

      console.log("New Delivery:", newDelivery); ////// debug

      setCurrentDelivery(newDelivery);

    } catch (err) {
      console.error("acceptDelivery error:", err);
    }
  };

  useEffect(() => {
    console.log("State updated:", currentDelivery);
  }, [currentDelivery]);                               /////////////////////// debug

  const updateDeliveryStatus = (newStatus) => {
    if (!["PICKUP", "OUTFORDELIVERY"].includes(newStatus)) return;
    setCurrentDelivery((prev) => ({
      ...prev,
      status: newStatus,
      history: [...prev.history, { status: newStatus, timestamp: new Date() }],
    }));
  };

  const completeDelivery = () => {
    localStorage.removeItem("currentDelivery");
    setCurrentDelivery(null);
  };

  return (
    <DeliveryContext.Provider
      value={{
        currentDelivery,
        acceptDelivery,
        updateDeliveryStatus,
        completeDelivery,
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => useContext(DeliveryContext);
