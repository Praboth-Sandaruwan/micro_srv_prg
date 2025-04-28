import React, { useState } from "react";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useDelivery } from "../contexts/DeliveryContext.jsx";
import { useNavigate } from "react-router-dom";

// Simple reusable popup/modal
function Popup({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100"
        >
          <XMarkIcon className="h-5 w-5 text-gray-500" />
        </button>
        {children}
      </div>
    </div>
  );
}

export default function OrderList() {
  // Example orders
  const [orders, setOrders] = useState([
    {
      id: 1,
      customer: "Alice Smith",
      address: "123 Main St, Springfield",
      items: [
        { name: "Burger", qty: 2 },
        { name: "Fries", qty: 1 },
      ],
      total: 18.5,
      status: "PENDING",
    },
    {
      id: 2,
      customer: "Bob Johnson",
      address: "456 Oak Ave, Metropolis",
      items: [
        { name: "Pizza", qty: 1 },
        { name: "Soda", qty: 2 },
      ],
      total: 22.0,
      status: "PENDING",
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { acceptDelivery } = useDelivery();
  const navigate = useNavigate();

  // Open order details popup
  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  // Accept order (show confirmation)
  const handleAccept = () => {
    acceptDelivery(selectedOrder);
    setShowDetails(false);
    setShowConfirm(true);
    navigate('/delivery')
    
  };

  // Confirm acceptance
  const confirmAccept = () => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === selectedOrder.id
          ? { ...order, status: "CONFIRMED" }
          : order
      )
    );
    setShowConfirm(false);
    setSelectedOrder(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Available Orders</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            onClick={() => handleOrderClick(order)}
            className={`border rounded-lg p-4 cursor-pointer transition hover:shadow-lg ${
              order.status === "CONFIRMED"
                ? "bg-green-50 border-green-400"
                : "bg-white"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{order.customer}</div>
                <div className="text-gray-500 text-sm">{order.address}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {order.items.length} items &middot; ${order.total.toFixed(2)}
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  order.status === "CONFIRMED"
                    ? "bg-green-200 text-green-800"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Order Details Popup */}
      <Popup open={showDetails} onClose={() => setShowDetails(false)}>
        {selectedOrder && (
          <div>
            <h3 className="text-xl font-bold mb-3">Order Details</h3>
            <div className="mb-2">
              <span className="font-semibold">Customer:</span>{" "}
              {selectedOrder.customer}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Address:</span>{" "}
              {selectedOrder.address}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Items:</span>
              <ul className="list-disc ml-6 mt-1">
                {selectedOrder.items.map((item, i) => (
                  <li key={i}>
                    {item.qty} &times; {item.name}
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
          </div>
        )}
      </Popup>

      {/* Confirm Accept Popup */}
      <Popup open={showConfirm} onClose={() => setShowConfirm(false)}>
        {selectedOrder && (
          <div>
            <h3 className="text-xl font-bold mb-4">Confirm Acceptance</h3>
            <p>
              Are you sure you want to accept the order for{" "}
              <span className="font-semibold">{selectedOrder.customer}</span>?
            </p>
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
                <CheckCircleIcon className="h-5 w-5 mr-1" />
                Confirm
              </button>
            </div>
          </div>
        )}
      </Popup>
    </div>
  );
}
