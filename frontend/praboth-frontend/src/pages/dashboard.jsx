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
import Navbar from "../components/navbar";

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
      <Navbar/>
      <DeliveryProvider>
        <OrderList />
      </DeliveryProvider> 
      </div>

  );
}
