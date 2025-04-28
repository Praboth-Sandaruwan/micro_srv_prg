// src/contexts/DeliveryContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";

const DeliveryContext = createContext(null);

export const DeliveryProvider = ({ children }) => {
  const [currentDelivery, setCurrentDelivery] = useState(() => {
    const savedDelivery = localStorage.getItem("currentDelivery");
    return savedDelivery ? JSON.parse(savedDelivery) : null;
  });

  useEffect(() => {
    if (currentDelivery) {
      localStorage.setItem("currentDelivery", JSON.stringify(currentDelivery));
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
        lat: 43.7128,  
        lng: -76.0060, 
        address: "Restaurant Address"
      },
      deliveryAddress: {
        lat: 46.7128,  
        lng: -78.0060, 
        fullAddress: "Delivery Address"
      }
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
