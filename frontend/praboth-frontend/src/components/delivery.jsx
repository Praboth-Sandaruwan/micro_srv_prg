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

const GOOGLE_MAPS_API_KEY = "AIzaSyDR5IF3eFb_qb_0v-W-E299o8Z0zu_jd08";

const containerStyle = {
  width: "100%",
  height: "100%",
};

export default function Delivery() {
  const { currentDelivery } = useDelivery();
  const [driverLocation, setDriverLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [error, setError] = useState(null);
  const intervalRef = useRef();
  const mapRef = useRef();

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

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

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
  }, [currentDelivery]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!driverLocation || !destination) return;

      try {
        // Step 1: Snap to nearest roads
        const snappedPoints = await snapToNearestRoad([
          driverLocation,
          destination,
        ]);

        console.log("Snapped Points Response:", snappedPoints);

        if (
          !snappedPoints ||
          snappedPoints.length < 2 ||
          !snappedPoints[0].location ||
          !snappedPoints[1].location
        ) {
          throw new Error("Snapping failed or incomplete location data.");
        }

        const snappedOrigin = {
          lat: snappedPoints[0].location.latitude,
          lng: snappedPoints[0].location.longitude,
        };

        const snappedDestination = {
          lat: snappedPoints[1].location.latitude,
          lng: snappedPoints[1].location.longitude,
        };

        // Step 2: Fetch route
        const routeData = await fetchRouteFromGoMaps(
          snappedOrigin,
          snappedDestination
        );
        setRoutePath(routeData.path);
      } catch (error) {
        console.error("Error fetching/snapping route:", error);
      }
    };

    fetchRoute();
  }, [driverLocation, destination]);


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
        {/* Driver marker */}
        <Marker position={driverLocation} label="You" />

        {/* Destination marker */}
        {destination && <Marker position={destination} label="Destination" />}

        {/* Route polyline */}
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
