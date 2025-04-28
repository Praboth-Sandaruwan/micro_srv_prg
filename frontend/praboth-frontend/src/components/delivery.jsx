import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import { useDelivery } from "../contexts/DeliveryContext";
import { jwtDecode } from "jwt-decode";
import { fetchConnectedDrivers } from "../api/driverapi";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function Routing({ start, end }) {
  const map = useMap();
  const routeRef = useRef();

  useEffect(() => {
    if (!start || !end) return;

    routeRef.current = L.Routing.control({
      waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
      routeWhileDragging: true,
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
    }).addTo(map);

    return () => {
      if (routeRef.current) {
        map.removeControl(routeRef.current);
      }
    };
  }, [map, start, end]);

  return null;
}

export default function Delivery() {
  const { currentDelivery } = useDelivery();
  const [driverLocation, setDriverLocation] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef();
  const mapRef = useRef();

  // Get driver ID from JWT token
  const getDriverId = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return null;
    }
    try {
      const decoded = jwtDecode(token);
      return decoded.id;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Poll driver location from backend
  useEffect(() => {
    const driverId = getDriverId();
    if (!driverId) return;

    const pollDriverLocation = async () => {
      try {
        const response = await fetchConnectedDrivers();
        if (!response.data) throw new Error("Failed to fetch driver location");

        // Convert object response to array of drivers
        const drivers = Object.entries(response.data).map(
          ([driverId, location]) => ({
            driverId,
            ...location,
          })
        );

        const currentDriver = drivers.find((d) => d.driverId === driverId);
        if (!currentDriver) {
          return (
            <div className="p-4 text-center">driver loading found</div>
          );
        }

        console.log("Current driver:", currentDriver);

        if (currentDriver) {
          setDriverLocation({
            latitude: currentDriver.latitude,
            longitude: currentDriver.longitude,
          });
        }
      } catch (error) {
        setError(error.message);
        console.error("Polling error:", error);
      }
    };

    // Start polling immediately and every second
    pollDriverLocation();
    intervalRef.current = setInterval(pollDriverLocation, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalRef.current);
  }, []);

  if (!currentDelivery) {
    return <div className="p-4 text-center">No active delivery found</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  if (!driverLocation) {
    return <div className="p-4 text-center">Acquiring your location...</div>;
  }

  const getRoutePoints = () => {
    const start = [driverLocation.latitude, driverLocation.longitude];
    let end;

    if (currentDelivery.status === "PICKUP") {
      end = [
        currentDelivery.restaurantLocation.lat,
        currentDelivery.restaurantLocation.lng,
      ];
    } else {
      end = [
        currentDelivery.deliveryAddress.lat,
        currentDelivery.deliveryAddress.lng,
      ];
    }

    return { start, end };
  };

  const { start, end } = getRoutePoints();

  return (
    <div className="h-[calc(100vh-4rem)] relative">
      <MapContainer
        center={start}
        zoom={13}
        scrollWheelZoom={true}
        ref={mapRef}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Routing start={start} end={end} />
      </MapContainer>

      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg z-[1000]">
        <h2 className="text-lg font-bold mb-2">
          {currentDelivery.status === "PICKUP"
            ? "Route to Restaurant"
            : "Route to Delivery"}
        </h2>
        <p className="text-sm">
          {currentDelivery.status === "PICKUP"
            ? currentDelivery.restaurantLocation.address
            : currentDelivery.deliveryAddress.fullAddress}
        </p>
      </div>
    </div>
  );
}
