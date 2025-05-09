import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BellIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import OrderList from "../components/orderlistcomponent";
import { DeliveryProvider } from "../contexts/DeliveryContext";
import {
  fetchNotificationsByUser,
  readnotification,
} from "../api/notificationapi";

export default function Dashboard() {
  const navigate = useNavigate();

  // Example notifications state
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter((n) => !n.status).length;

  // Popup state
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef();

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  useEffect(() => {
    const id = localStorage.getItem("wsDriverId");
    fetchNotificationsByUser(id).then((res) => {
      const filtered = res?.filter(notification => notification.user);
      setNotifications(filtered);
    });
  }, []);

  const handleOpenNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("wsDriverId");
    navigate("/login");
  };

  const handleNotificationClick = async (notifId) => {
    try {
      await readnotification(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, status: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded shadow-lg">
      {/* Header with buttons */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Driver Dashboard</h1>
        <div className="flex items-center gap-4">
          {/* Notification Button with Badge */}
          <div className="relative">
            <button
              className="relative p-2 rounded-full hover:bg-blue-100 transition"
              onClick={handleOpenNotifications}
              aria-label="Notifications"
            >
              <BellIcon className="h-7 w-7 text-blue-700" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            {/* Notification Popup */}
            {showNotifications && (
              <div
                ref={notifRef}
                className="absolute right-0 z-20 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg"
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <span className="font-semibold text-gray-700">
                    Notifications
                  </span>
                  <button
                    className="p-1 hover:bg-gray-200 rounded"
                    onClick={() => setShowNotifications(false)}
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <ul className="max-h-60 overflow-y-auto divide-y">
                  {notifications.length === 0 ? (
                    <li className="p-4 text-gray-500 text-sm text-center">
                      No notifications
                    </li>
                  ) : (
                    notifications.reverse().map((notif) => (
                      <li
                        key={notif._id}
                        onClick={() => handleNotificationClick(notif._id)}
                        className={`p-4 text-sm cursor-pointer hover:bg-gray-100 ${
                          notif.status
                            ? "text-gray-500"
                            : "text-gray-800 font-medium"
                        }`}
                      >
                        {notif.message} : {notif.order}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
          {/* Profile Button */}
          <button
            className="p-2 rounded-full hover:bg-blue-100 transition"
            onClick={handleProfileClick}
            aria-label="Profile"
          >
            <UserCircleIcon className="h-8 w-8 text-blue-700" />
          </button>
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </div>
      
      <DeliveryProvider>
        <OrderList />
      </DeliveryProvider>
    </div>
  );
}
