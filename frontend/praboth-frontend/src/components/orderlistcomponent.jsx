import React, { useState, useEffect } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import Popup from "./Popup";
import { useNavigate } from "react-router-dom";
import { useDelivery } from "../contexts/DeliveryContext.jsx";
import { updateOrder, getPendingOrders } from "../api/ordersapi.js";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const { acceptDelivery } = useDelivery();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getPendingOrders();
        setOrders(data);
      } catch (err) {
        console.error("Failed to load orders", err);
      }
    };
    loadOrders();
  }, []);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const handleAccept = () => {
    setShowDetails(false);
    setShowConfirm(true);
  };

  const handleConfDelClick = () => {
    navigate("/delivery");
  }

  const confirmAccept = async () => {
    try {
      const updatedOrder = await updateOrder(selectedOrder._id, {
        status: "CONFIRMED",
      });

      setOrders((prev) =>
        prev.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );

      //console.log("Order accepted:", updatedOrder); working

      acceptDelivery(updatedOrder);
      setShowConfirm(false);
      setSelectedOrder(null);
      navigate("/delivery");
    } catch (err) {
      console.error("Order acceptance failed:", err);
      setShowConfirm(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Available Orders</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            onClick={() => handleOrderClick(order)}
            className={`border rounded-lg p-4 cursor-pointer transition hover:shadow-lg ${
              order.status === "CONFIRMED"
                ? "bg-green-50 border-yellow-300"
                : "bg-white"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">Order #{order.title}</div>
                <div className="text-gray-500 text-sm">
                  {order.deliveryAddress.street}, {order.deliveryAddress.city}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {order.items.length} items &middot; ${order.total.toFixed(2)}
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  order.status === "CONFIRMED"
                    ? "bg-yellow-100 text-yellow-800" : order.status === "OUTFORDELIVERY"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Popup open={showDetails} onClose={() => setShowDetails(false)}>
        {selectedOrder && (
          <div>
            <h3 className="text-xl font-bold mb-3">Order Details</h3>
            <div className="mb-2">
              <span className="font-semibold">Order ID:</span>{" "}
              {selectedOrder._id}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Address:</span>{" "}
              {selectedOrder.deliveryAddress.street},{" "}
              {selectedOrder.deliveryAddress.city}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Items:</span>
              <ul className="list-disc ml-6 mt-1">
                {selectedOrder.items.map((item, i) => (
                  <li key={i}>
                    {item.quantity} × {item.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-4">
              <span className="font-semibold">Total:</span> $
              {selectedOrder.total.toFixed(2)}
            </div>
            {selectedOrder.status === "PENDING" && (
              <button
                onClick={handleAccept}
                className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg mt-2"
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Accept Order
              </button>
            )}
            {selectedOrder.status === "CONFIRMED" && (
              <button
                onClick={handleConfDelClick}
                className="w-full flex items-center justify-center bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 rounded-lg mt-2"
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Show Route
              </button>
            )}
            {selectedOrder.status === "OUTFORDELIVERY" && (
              <button
                onClick={handleConfDelClick}
                className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg mt-2"
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Show Route
              </button>
            )}
          </div>
        )}
      </Popup>

      <Popup open={showConfirm} onClose={() => setShowConfirm(false)}>
        {selectedOrder && (
          <div>
            <h3 className="text-xl font-bold mb-4">Confirm Acceptance</h3>
            <p>Are you sure you want to accept Order #{selectedOrder._id}?</p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmAccept}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Confirm
              </button>
            </div>
          </div>
        )}
      </Popup>
    </div>
  );
}
