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

  const acceptDelivery = (delivery) => {
    setCurrentDelivery({
      ...delivery,
      status: "PICKUP",
      history: [{ status: "PICKUP", timestamp: new Date() }],
      restaurantLocation: {
        lat: 6.829452,
        lng: 79.934029,
        address: "Restaurant Address",
      },
      deliveryAddress: {
        lat: 6.820452,
        lng: 79.943029,
        fullAddress: "Delivery Address",
      },
    });
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
