import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, useLoadScript, Polyline } from "@react-google-maps/api";
import { AdvancedMarkerElement } from "@googlemaps/marker-library"; // Import AdvancedMarkerElement
import { useDelivery } from "../contexts/DeliveryContext";
import { jwtDecode } from "jwt-decode";
import { fetchConnectedDrivers } from "../api/driverapi";
import { fetchRouteFromGoMaps, snapToNearestRoad } from "../api/gomapsapi";
import { useNavigate } from "react-router-dom";

const GOOGLE_MAPS_API_KEY = "AIzaSyDR5IF3eFb_qb_0v-W-E299o8Z0zu_jd08";

const containerStyle = {
  width: "100%",
  height: "100%",
};

export default function Delivery() {
  const { currentDelivery, updateDeliveryStatus, completeDelivery } =
    useDelivery();
  const [driverLocation, setDriverLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [error, setError] = useState(null);
  const intervalRef = useRef();
  const mapRef = useRef();
  const driverMarkerRef = useRef();
  const destinationMarkerRef = useRef();
  const navigate = useNavigate();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["marker"],
  });

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

  useEffect(() => {
    const driverId = getDriverId();
    if (!driverId) return;

    const pollDriverLocation = async () => {
      try {
        const response = await fetchConnectedDrivers();
        if (!response.data) throw new Error("Failed to fetch driver location");

        const drivers = Object.entries(response.data).map(
          ([driverId, location]) => ({
            driverId,
            ...location,
          })
        );

        const currentDriver = drivers.find((d) => d.driverId === driverId);
        if (currentDriver) {
          setDriverLocation({
            lat: currentDriver.latitude,
            lng: currentDriver.longitude,
          });
        }
      } catch (error) {
        setError(error.message);
        console.error("Polling error:", error);
      }
    };

    pollDriverLocation();
    intervalRef.current = setInterval(pollDriverLocation, 3000);

    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (!currentDelivery) return;

    const dest =
      currentDelivery.status === "PICKUP"
        ? {
            lat: currentDelivery.restaurantLocation.lat,
            lng: currentDelivery.restaurantLocation.lng,
          }
        : {
            lat: currentDelivery.deliveryAddress.lat,
            lng: currentDelivery.deliveryAddress.lng,
          };

    setDestination(dest);
    setRoutePath([]); // Clear previous routes
  }, [currentDelivery]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!driverLocation || !destination) return;

      try {
        const routeData = await fetchRouteFromGoMaps(
          driverLocation,
          destination
        );
        const sampledPoints = samplePoints(routeData.path, 10);
        const snappedPoints = await snapToNearestRoad(sampledPoints);

        setRoutePath(
          snappedPoints.map((p) => ({
            lat: p.location.latitude,
            lng: p.location.longitude,
          }))
        );
      } catch (error) {
        setError(error.message);
        console.error("Error fetching/snapping route:", error);
      }
    };

    fetchRoute();
  }, [driverLocation, destination, currentDelivery]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setDriverLocation({ lat: latitude, lng: longitude });
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handlePickup = () => {
    updateDeliveryStatus("OUTFORDELIVERY");
  };

  const handleCompleteDelivery = () => {
    completeDelivery();
    navigate("/dashboard");
  };

  if (!isLoaded) return <div>Loading Map...</div>;

  if (!currentDelivery)
    return <div className="p-4 text-center">No active delivery</div>;

  if (error)
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  if (!driverLocation)
    return <div className="p-4 text-center">Getting location...</div>;

  return (
    <div className="h-[calc(100vh-4rem)] relative">
      <GoogleMap
        center={driverLocation}
        zoom={14}
        mapContainerStyle={containerStyle}
        onLoad={(map) => (mapRef.current = map)}
      >
        {/* Driver Marker */}
        {driverLocation && (
          <AdvancedMarkerElement
            position={driverLocation}
            map={mapRef.current}
            title="You"
          />
        )}
        {/* Destination Marker */}
        {destination && (
          <AdvancedMarkerElement
            position={destination}
            map={mapRef.current}
            title="Destination"
          />
        )}

        {/* Route Polyline */}
        {routePath.length > 0 && (
          <Polyline
            path={routePath}
            options={{
              strokeColor: "#0ea5e9",
              strokeOpacity: 0.9,
              strokeWeight: 5,
              icons: [
                {
                  icon: {
                    path: window.google.maps.SymbolPath.FORWARD_OPEN_ARROW,
                  },
                  offset: "100%",
                },
              ],
            }}
          />
        )}
      </GoogleMap>

      {/* Top Left Control Panel */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-4 rounded-lg shadow-lg z-[1000] max-w-[300px]">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">
          {currentDelivery.status === "PICKUP"
            ? "Route to Restaurant"
            : "Route to Delivery"}
        </h2>
        <p className="text-sm mb-4 text-gray-600">
          {currentDelivery.status === "PICKUP"
            ? currentDelivery.restaurantLocation.address
            : currentDelivery.deliveryAddress.fullAddress}
        </p>

        {currentDelivery.status === "PICKUP" && (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full mb-2 transition"
            onClick={handlePickup}
          >
            Pickup Order
          </button>
        )}
        {currentDelivery.status === "OUTFORDELIVERY" && (
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full transition"
            onClick={handleCompleteDelivery}
          >
            Complete Delivery
          </button>
        )}
      </div>
    </div>
  );
}

// Helper to sample N evenly spaced points from a path
function samplePoints(path, count) {
  if (!path || path.length <= count) return path;
  const step = Math.floor(path.length / (count - 1));
  const result = [];
  for (let i = 0; i < path.length; i += step) {
    result.push(path[i]);
  }
  if (result[result.length - 1] !== path[path.length - 1]) {
    result.push(path[path.length - 1]);
  }
  return result;
}
