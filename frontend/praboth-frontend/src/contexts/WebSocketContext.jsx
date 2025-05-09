// src/contexts/WebSocketContext.jsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [locationTracking, setLocationTracking] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const socketRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const connectingRef = useRef(false);

  const navigate = useNavigate();

  // Close and clean up socket
  const closeSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    clearInterval(heartbeatIntervalRef.current);
    heartbeatIntervalRef.current = null;
    setSocket(null);
  };

  // Reconnect logic with exponential backoff
  const reconnect = (driverId, token) => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    if (retryCount >= 10) {
      console.error("Max retries reached, stopping reconnection.");
      return;
    }

    const delay =
      Math.min(1000 * Math.pow(2, retryCount), 30000) +
      Math.floor(Math.random() * 3000);

    retryTimeoutRef.current = setTimeout(() => {
      setRetryCount((prev) => prev + 1);
      connectWebSocket(driverId, token);
    }, delay);
  };

  // WebSocket connection function
  const connectWebSocket = useCallback(
    (driverId, token) => {
      if (connectingRef.current) return;
      connectingRef.current = true;
  
      closeSocket(); // Ensure cleanup
  
      const ws = new WebSocket(
        `ws://localhost:8011/deliverydriver/api/v1/ws/drivers/${driverId}?token=${token}`
      );
      socketRef.current = ws;
      setSocket(ws); // New state added
  
      ws.onopen = () => {
        setConnected(true);
        setRetryCount(0);
        connectingRef.current = false;
        localStorage.setItem("wsDriverId", driverId);
  
        if (heartbeatIntervalRef.current)
          clearInterval(heartbeatIntervalRef.current);
  
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 10000);
      };
  
      ws.onclose = (event) => {
        setConnected(false);
        setLocationTracking(false);
        connectingRef.current = false;
  
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
  
        if (event.code === 1008) {
          localStorage.removeItem("token");
          localStorage.removeItem("wsDriverId");
          navigate("/login");
        } else if (event.code !== 1000) {
          reconnect(driverId, token); // Delegate to reconnect
        }
      };
  
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        connectingRef.current = false;
      };
    },
    [navigate]
  );
  

  // Reconnect on page load if token and driverId exist
  useEffect(() => {
    const token = localStorage.getItem("token");
    const driverId = localStorage.getItem("wsDriverId");
    if (token && driverId) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp > currentTime) {
          connectWebSocket(driverId, token);
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("wsDriverId");
          navigate("/login");
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("wsDriverId");
        navigate("/login");
      }
    }
  }, [connectWebSocket, navigate]);

  // Reconnect on tab visibility or online
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (!connected && socketRef.current?.readyState !== WebSocket.OPEN) {
          const token = localStorage.getItem("token");
          const driverId = localStorage.getItem("wsDriverId");
          if (token && driverId) {
            connectWebSocket(driverId, token);
          }
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleVisibilityChange);
    };
  }, [connectWebSocket, connected]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      closeSocket();
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      connectingRef.current = false;
    };
  }, []);

  useEffect(() => {
    let watchId = null;
    if (locationTracking && socketRef.current?.readyState === WebSocket.OPEN) {
      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const message = { latitude, longitude };
            if (socketRef.current.readyState === WebSocket.OPEN) {
              socketRef.current.send(JSON.stringify(message));
            }
          },
          (error) => {
            console.error("Error watching position:", error);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 10000,
          }
        );
      }
    }
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [locationTracking, connected]);

  // Auto-start location tracking when connected
  useEffect(() => {
    if (
      connected &&
      !locationTracking &&
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN
    ) {
      setLocationTracking(true);
    }
  }, [connected, locationTracking]);

  // Manual controls for location tracking
  const startLocationTracking = useCallback(() => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket not connected");
      return false;
    }
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return false;
    }
    setLocationTracking(true);
    return true;
  }, []);

  const stopLocationTracking = useCallback(() => {
    setLocationTracking(false);
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        connected,
        locationTracking,
        connectWebSocket,
        startLocationTracking,
        stopLocationTracking,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
