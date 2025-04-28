// src/pages/Dashboard.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useLocationTracker } from "../hooks/useLocationTracker";

export default function Dashboard() {
  const {
    socket,
    connected,
    locationTracking,
    startLocationTracking,
    stopLocationTracking,
  } = useWebSocket();
  const { isTracking } = useLocationTracker();  // Hook to track location
  const navigate = useNavigate();

  // Add the logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("wsDriverId");
    if (socket) {
      socket.close();
    }
    navigate("/login");
  };

  useEffect(() => {
    // Start tracking if the driver is connected and location tracking is not active
    if (connected && !locationTracking) {
      startLocationTracking();
    }

    // Check if geolocation permission is denied
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "denied") {
          console.error("Location permission denied");
        }
      });
    }
  }, [connected, locationTracking, startLocationTracking]);

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded shadow-lg">
      {/* Add logout button in header area */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Driver Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          Logout
        </button>
      </div>

      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
        <div className="flex items-center">
          <span
            className={`h-3 w-3 rounded-full mr-2 ${
              connected ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
          <p>{connected ? "Connected" : "Disconnected"}</p>
        </div>
      </div>

      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Location Tracking</h2>
        <div className="flex items-center mb-4">
          <span
            className={`h-3 w-3 rounded-full mr-2 ${
              isTracking ? "bg-green-500" : "bg-gray-400"
            }`}
          ></span>
          <p>{isTracking ? "Active" : "Inactive"}</p>
        </div>

        <button
          onClick={isTracking ? stopLocationTracking : startLocationTracking}
          className={`px-4 py-2 rounded font-medium ${
            isTracking
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {isTracking ? "Stop Tracking" : "Start Tracking"}
        </button>
      </div>

      {/* Rest of dashboard content */}
    </div>
  );
}
