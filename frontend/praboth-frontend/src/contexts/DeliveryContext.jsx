import React, { createContext, useState, useEffect, useContext } from "react";

const DeliveryContext = createContext(null);

export const DeliveryProvider = ({ children }) => {
  const [currentDelivery, setCurrentDelivery] = useState(() => {
    const savedDelivery = localStorage.getItem("currentDelivery");
    if (savedDelivery) {
      const parsed = JSON.parse(savedDelivery);
      parsed.history = parsed.history.map((h) => ({
        ...h,
        timestamp: new Date(h.timestamp),
      }));
      return parsed;
    }
    return null;
  });

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

      console.log("New delivery accepted:", newDelivery);

      setCurrentDelivery(newDelivery);
      localStorage.setItem("currentDelivery", JSON.stringify(newDelivery));
    } catch (err) {
      console.error("acceptDelivery error:", err);
    }
  };

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
