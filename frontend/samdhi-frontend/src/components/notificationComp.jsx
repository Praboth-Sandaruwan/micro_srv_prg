import React, { useState, useRef, useEffect } from "react";
import { BellIcon, XMarkIcon, StarIcon } from "@heroicons/react/24/outline";
import {
  fetchNotificationsByUser,
  readnotification,
} from "../api/notificationapi";
import { getOrderById } from "../api/ordersapi";
import { rateDriver } from "../api/driverapi";

export default function NotificationDropdown({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [rating, setRating] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const notifRef = useRef();

  useEffect(() => {
    if (!userId) return;
    fetchNotificationsByUser(userId).then(setNotifications);
  }, [userId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  useEffect(() => {
    if (selectedNotif?.order) {
      getOrderById(selectedNotif.order).then(setOrderDetails);
    } else {
      setOrderDetails(null);
    }
  }, [selectedNotif]);

  const unreadCount = notifications.filter((n) => !n.status).length;

  const handleNotifClick = (notif) => {
    setSelectedNotif(notif);
    setShowDropdown(false);
  };

  const handleMarkAsRead = async () => {
    if (!selectedNotif) return;
    await readnotification(selectedNotif._id);
    setNotifications((prev) =>
      prev.map((n) =>
        n._id === selectedNotif._id ? { ...n, status: true } : n
      )
    );
    setSelectedNotif(null);
  };

  const handleRating = async (rate) => {
    setRatingSubmitting(true);
    try {
      await rateDriver(orderDetails.deliverydriverId, { rating: rate });
      setRating(rate);
    } finally {
      setRatingSubmitting(false);
    }
  };

  return (
    <>
      <div className="relative" ref={notifRef}>
        <button
          className="relative p-2 rounded-full hover:bg-blue-100 transition"
          onClick={() => setShowDropdown((prev) => !prev)}
          aria-label="Notifications"
        >
          <BellIcon className="h-7 w-7 text-blue-700" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
        {showDropdown && (
          <div className="absolute right-0 z-30 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold text-gray-700">Notifications</span>
              <button
                className="p-1 hover:bg-gray-200 rounded"
                onClick={() => setShowDropdown(false)}
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <ul className="max-h-80 overflow-y-auto divide-y">
              {notifications.length === 0 ? (
                <li className="p-4 text-gray-500 text-sm text-center">
                  No notifications
                </li>
              ) : (
                notifications
                  .slice()
                  .reverse()
                  .map((notif) => (
                    <li
                      key={notif._id}
                      onClick={() => handleNotifClick(notif)}
                      className={`p-4 text-sm cursor-pointer hover:bg-blue-50 transition ${
                        notif.status
                          ? "text-gray-500"
                          : "text-gray-800 font-medium bg-blue-50/50"
                      }`}
                    >
                      {notif.message}
                      <div className="text-xs text-gray-400 mt-1">
                        Order: {notif.order}
                      </div>
                    </li>
                  ))
              )}
            </ul>
          </div>
        )}
      </div>

      {selectedNotif && orderDetails && (
        <NotifDetailsPopup
          notif={selectedNotif}
          order={orderDetails}
          onClose={() => setSelectedNotif(null)}
          onMarkAsRead={handleMarkAsRead}
          rating={rating}
          setRating={setRating}
          onRate={handleRating}
          ratingSubmitting={ratingSubmitting}
        />
      )}
    </>
  );
}

function NotifDetailsPopup({
  notif,
  order,
  onClose,
  onMarkAsRead,
  rating,
  setRating,
  onRate,
  ratingSubmitting,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold text-blue-800 mb-2">
          Notification Details
        </h2>
        <div className="mb-2 text-gray-700">{notif.message}</div>
        <div className="mb-4">
          <span className="font-semibold">Order:</span> #{order.title}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Status:</span>{" "}
          <span className="inline-block px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
            {order.status}
          </span>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Items:</span>
          <ul className="list-disc ml-6 mt-1 text-gray-700">
            {order.items.map((item, i) => (
              <li key={i}>
                {item.quantity} × {item.name}{" "}
                <span className="text-gray-400">(${item.price})</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Total:</span> $
          {order.total.toFixed(2)}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Delivery Address:</span>{" "}
          {order.deliveryAddress.street
            ? `${order.deliveryAddress.street}, ${
                order.deliveryAddress.city || ""
              }`
            : `Lat: ${order.deliveryAddress.lat}, Lng: ${order.deliveryAddress.lng}`}
        </div>
        <div className="flex gap-3">
          {!notif.status && (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              onClick={onMarkAsRead}
            >
              Mark as Read
            </button>
          )}
          <button
            className="px-4 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 transition"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        {order.status === "COMPLETED" && (
          <div className="mt-6 border-t pt-4">
            <div className="font-semibold mb-2 text-gray-700">
              Rate Your Driver
            </div>
            <div className="flex gap-1 items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`h-7 w-7 cursor-pointer transition ${
                    rating >= star ? "text-yellow-400" : "text-gray-300"
                  }`}
                  onClick={() => onRate(star)}
                  disabled={ratingSubmitting}
                />
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-yellow-700 font-semibold">
                  {rating}/5
                </span>
              )}
            </div>
            {ratingSubmitting && (
              <div className="text-xs text-gray-400 mt-1">
                Submitting rating...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
