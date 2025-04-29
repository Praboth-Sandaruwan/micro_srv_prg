import React, { useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  Marker,
  Polyline,
  useLoadScript,
} from "@react-google-maps/api";
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
  const navigate = useNavigate();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
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

    const getDestination = () => {
      if (currentDelivery.status === "PICKUP") {
        return {
          lat: currentDelivery.restaurantLocation.lat,
          lng: currentDelivery.restaurantLocation.lng,
        };
      } else {
        return {
          lat: currentDelivery.deliveryAddress.lat,
          lng: currentDelivery.deliveryAddress.lng,
        };
      }
    };

    setDestination(getDestination());
    setRoutePath([]);
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
  
        // Optionally, if you have a live driver marker
        if (driverMarkerRef.current) {
          driverMarkerRef.current.position = { lat: latitude, lng: longitude };
        }
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

  if (!isLoaded) {
    return <div>Loading Map...</div>;
  }

  if (!currentDelivery) {
    return <div className="p-4 text-center">No active delivery</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  if (!driverLocation) {
    return <div className="p-4 text-center">Getting location...</div>;
  }

  return (
    <div className="h-[calc(100vh-4rem)] relative">
      <GoogleMap
        center={driverLocation}
        zoom={13}
        mapContainerStyle={containerStyle}
        onLoad={(map) => (mapRef.current = map)}
      >
        <Marker position={driverLocation} label="You" />
        {destination && <Marker position={destination} label="Destination" />}
        {routePath.length > 0 && (
          <Polyline
            path={routePath}
            options={{
              strokeColor: "#007bff",
              strokeOpacity: 0.8,
              strokeWeight: 5,
            }}
          />
        )}
      </GoogleMap>

      {/* Top Left Panel */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg z-[1000]">
        <h2 className="text-lg font-bold mb-2">
          {currentDelivery.status === "PICKUP"
            ? "Route to Restaurant"
            : "Route to Delivery"}
        </h2>
        <p className="text-sm mb-2">
          {currentDelivery.status === "PICKUP"
            ? currentDelivery.restaurantLocation.address
            : currentDelivery.deliveryAddress.fullAddress}
        </p>

        {/* Pickup Button */}
        {currentDelivery.status === "PICKUP" && (
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
            onClick={handlePickup}
          >
            Pickup Order
          </button>
        )}
        {/* Complete Delivery Button */}
        {currentDelivery.status === "OUTFORDELIVERY" && (
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm w-full"
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
