// src/hooks/useLocationTracker.js
import { useState, useEffect } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";

export const useLocationTracker = () => {
  const { socket, connected } = useWebSocket();
  const [isTracking, setIsTracking] = useState(false);
  const [location, setLocation] = useState(null);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    if (isTracking && connected && !intervalId) {
      const id = setInterval(() => {
        // Get the geolocation and send it
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });

          // Send location through WebSocket
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify({ latitude, longitude, type: "location" })
            );
          }
        });
      }, 600); // Send every 5 seconds (5000ms)

      setIntervalId(id);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId); // Clean up interval on unmount or when tracking stops
      }
    };
  }, [isTracking, connected, intervalId, socket]);

  const startLocationTracking = () => {
    setIsTracking(true);
  };

  const stopLocationTracking = () => {
    setIsTracking(false);
    clearInterval(intervalId); // Stop the interval when tracking stops
  };

  return { isTracking, location, startLocationTracking, stopLocationTracking };
};
