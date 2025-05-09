import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyOrdersUsr } from "../api/ordersapi";
import {
  XMarkIcon,
  MapPinIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";

const statusOptions = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Out for Delivery", value: "OUTFORDELIVERY" },
  { label: "Completed", value: "COMPLETED" },
];

function filterOrdersByStatus(orders, status) {
  if (!status || status === "ALL") return orders;
  return orders.filter((order) => order.status === status);
}

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const customerId = user._id;

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      const data = await getMyOrdersUsr(customerId);
      setOrders(data);
      setLoading(false);
    }
    fetchOrders();
  }, [customerId]);

  const filteredOrders = filterOrdersByStatus(orders, statusFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-indigo-800">My Orders</h1>
        {/* Status Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              className={`px-4 py-2 rounded-full font-semibold transition
                ${
                  statusFilter === opt.value
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                }
              `}
              onClick={() => setStatusFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {/* Order List */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center text-gray-400 italic py-8">
            No orders found.
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className={`rounded-xl border shadow-sm p-5 cursor-pointer transition
                  hover:shadow-lg bg-gradient-to-r from-white to-indigo-50
                  flex flex-col sm:flex-row sm:items-center sm:justify-between`}
                onClick={() => setSelectedOrder(order)}
              >
                <div>
                  <div className="font-semibold text-indigo-800 text-lg">
                    Order #{order.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {order.items.map((item, idx) => (
                      <span key={idx}>
                        {item.quantity} × {item.name}
                        {idx < order.items.length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Placed: {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 mt-3 sm:mt-0">
                  <StatusBadge status={order.status} />
                  {order.status === "OUTFORDELIVERY" && (
                    <button
                      className="mt-2 px-4 py-1 bg-indigo-600 text-white rounded-full text-xs font-semibold hover:bg-indigo-700 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/delivery/${order._id}`);
                      }}
                    >
                      Track
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Popup for Order Details */}
        {selectedOrder && (
          <OrderDetailsPopup
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onTrack={() => {
              setSelectedOrder(null);
              navigate(`/delivery/${selectedOrder._id}`);
            }}
          />
        )}
      </div>
    </div>
  );
}

// --- Status Badge ---
function StatusBadge({ status }) {
  const statusMap = {
    PENDING: {
      color: "bg-yellow-100 text-yellow-800",
      label: "Pending",
      icon: ClockIcon,
    },
    CONFIRMED: {
      color: "bg-blue-100 text-blue-800",
      label: "Confirmed",
      icon: CheckCircleIcon,
    },
    OUTFORDELIVERY: {
      color: "bg-indigo-100 text-indigo-800",
      label: "Out for Delivery",
      icon: TruckIcon,
    },
    COMPLETED: {
      color: "bg-green-100 text-green-800",
      label: "Completed",
      icon: CheckCircleIcon,
    },
  };
  const {
    color,
    label,
    icon: Icon,
  } = statusMap[status] || {
    color: "bg-gray-100 text-gray-800",
    label: status,
    icon: ClockIcon,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${color}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </span>
  );
}

// --- Order Details Popup ---
function OrderDetailsPopup({ order, onClose, onTrack }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fadeIn">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold text-indigo-800 mb-3">
          Order #{order.title}
        </h2>
        <div className="mb-2 flex items-center gap-2 text-gray-600">
          <MapPinIcon className="h-5 w-5 text-indigo-400" />
          <span>
            {order.deliveryAddress.street
              ? `${order.deliveryAddress.street}, ${
                  order.deliveryAddress.city || ""
                }`
              : `Lat: ${order.deliveryAddress.lat}, Lng: ${order.deliveryAddress.lng}`}
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
        <div className="mb-2">
          <span className="font-semibold">Status:</span>{" "}
          <StatusBadge status={order.status} />
        </div>
        <div className="mb-4">
          <span className="font-semibold">Order History:</span>
          <ul className="ml-6 mt-1 text-xs text-gray-500">
            {order.history?.map((h, idx) => (
              <li key={idx}>
                {h.status}: {new Date(h.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
        {order.status === "OUTFORDELIVERY" && (
          <button
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
            onClick={onTrack}
          >
            Track Delivery
          </button>
        )}
      </div>
    </div>
  );
}
