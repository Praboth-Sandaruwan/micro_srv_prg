import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useWebSocket from "react-use-websocket";

export default function Dashboard() {
  const {
    socket,
    connected,
    locationTracking, // Use this for status instead of isTracking
    startLocationTracking,
    stopLocationTracking,
  } = useWebSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("wsDriverId");
    if (socket) {
      socket.close();
    }
    navigate("/login");
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded shadow-lg">
      {/* Header with logout button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Driver Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
