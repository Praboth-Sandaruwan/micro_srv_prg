import React, { useEffect, useState } from "react";
import { updateDriver, fetchDriverById } from "../api/driverapi";
import { getMyOrdersDrv } from "../api/ordersapi";
import {
  StarIcon,
  TruckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import Navbar from "../components/navbar";

export default function DriverProfilePage() {
  const [driver, setDriver] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const driverId = localStorage.getItem("wsDriverId");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const driverData = await fetchDriverById(driverId);
      const orderData = await getMyOrdersDrv(driverId);
      console.log(driverData, orderData);
      setDriver(driverData);
      setOrders(orderData.filter(order => order.status === "COMPLETED"));
      setLoading(false);
    }
    fetchData();
  }, [driverId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Driver not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-4">
      <Navbar/>
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-8">
          <div className="bg-blue-100 rounded-full p-4">
            <TruckIcon className="h-12 w-12 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{driver.name}</h1>
            <div className="text-gray-500">{driver.email}</div>
            <div className="mt-2 flex gap-3 items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                {driver.vehicle.charAt(0).toUpperCase() +
                  driver.vehicle.slice(1)}{" "}
                Vehicle
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">
              {driver.deliveries}
            </div>
            <div className="text-xs text-gray-500">Deliveries</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 text-center">
            <div className="flex justify-center">
              <StarIcon className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="text-lg font-semibold text-yellow-600">
              {driver.rating.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">Rating</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-lg font-semibold text-green-600">
              {driver.city}
            </div>
            <div className="text-xs text-gray-500">City</div>
          </div>
          <div className="bg-indigo-50 rounded-xl p-4 text-center">
            <div className="text-lg font-semibold text-indigo-600">
              {driver.phone}
            </div>
            <div className="text-xs text-gray-500">Phone</div>
          </div>
        </div>

        {/* Completed Deliveries */}
        <div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
            Completed Deliveries
          </h2>
          {orders.length === 0 ? (
            <div className="text-gray-400 italic">
              No completed deliveries yet.
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="rounded-xl border border-gray-100 shadow-sm bg-gradient-to-r from-white to-blue-50 p-5"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-semibold text-blue-800">
                      Order #{order.title}
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">To:</span>{" "}
                    {order.deliveryAddress.lat}, {order.deliveryAddress.lng}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {order.items.map((item, idx) => (
                      <span key={idx}>
                        {item.quantity} × {item.name}
                        {idx < order.items.length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400">
                    <span className="font-semibold">Delivered:</span>{" "}
                    {order.history && order.history.length > 0
                      ? new Date(
                          order.history.find((h) => h.status === "COMPLETED")
                            ?.timestamp || order.updatedAt
                        ).toLocaleString()
                      : new Date(order.updatedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
