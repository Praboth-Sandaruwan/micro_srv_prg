import React, { useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  useLoadScript,
  Polyline,
  Marker,
} from "@react-google-maps/api";
import { useDelivery } from "../contexts/DeliveryContext";
import { jwtDecode } from "jwt-decode";
import { fetchConnectedDrivers } from "../api/driverapi";
import { fetchRouteFromGoMaps, snapToNearestRoad } from "../api/gomapsapi";
import { useNavigate } from "react-router-dom";
import DriverMarker from "../components/DriverMarker";
import DestinationMarker from "../components/DestinationMarker";
import { samplePoints } from "../utils/MapHelper";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const libraries = ["places", "geometry"];

const GOOGLE_MAPS_API_KEY = "AIzaSyDR5IF3eFb_qb_0v-W-E299o8Z0zu_jd08";

export default function Delivery() {
  const { currentDelivery, updateDeliveryStatus, completeDelivery, loading } =
    useDelivery();

  const [driverLocation, setDriverLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const intervalRef = useRef();
  const mapRef = useRef();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    let driverId;
    try {
      const decoded = jwtDecode(token);
      driverId = decoded.id;
    } catch (error) {
      console.error("Invalid token:", error);
      window.location.href = "/login";
      return;
    }

    const pollDriverLocation = async () => {
      try {
        const response = await fetchConnectedDrivers();
        if (!response.data) throw new Error("Driver location fetch failed.");

        const drivers = Object.entries(response.data).map(([id, location]) => ({
          driverId: id,
          ...location,
        }));

        const currentDriver = drivers.find((d) => d.driverId === driverId);
        if (currentDriver) {
          setDriverLocation({
            lat: currentDriver.latitude,
            lng: currentDriver.longitude,
          });
        }
      } catch (error) {
        console.error("Polling error:", error);
        setError(error.message);
      }
    };

    pollDriverLocation();
    intervalRef.current = setInterval(pollDriverLocation, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (!currentDelivery) return;

    const targetLocation =
      currentDelivery.status === "CONFIRMED"
        ? currentDelivery.restaurantLocation
        : currentDelivery.deliveryAddress;

    setDestination({ lat: targetLocation.lat, lng: targetLocation.lng });
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
        console.error("Route error:", error);
        setError(error.message);
      }
    };

    fetchRoute();
  }, [driverLocation, destination, currentDelivery]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setDriverLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Geolocation watch error:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handlePickup = async () => {
    await updateDeliveryStatus("OUTFORDELIVERY");
  };

  const handleCompleteDelivery = async () => {
    await completeDelivery();
    navigate("/dashboard");
  };

  if (loadError)
    return (
      <div className="p-4 text-center text-red-500">
        Map load error: {loadError.message}
      </div>
    );
  if (!isLoaded) return <div className="p-4 text-center">Loading map...</div>;
  if (loading)
    return (
      <div className="p-4 text-center">Checking for active delivery...</div>
    );

  if (!currentDelivery)
    return (
      <div className="p-4 text-center text-yellow-600">
        No active delivery assigned.
      </div>
    );

  if (error)
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="h-[calc(100vh-4rem)] relative">
      <GoogleMap
        center={driverLocation || { lat: 0, lng: 0 }}
        zoom={14}
        mapContainerStyle={containerStyle}
        mapId="" // No Map ID used
        onLoad={(map) => (mapRef.current = map)}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {driverLocation && <DriverMarker position={driverLocation} />}
        {destination && <DestinationMarker position={destination} />}
        {routePath.length > 0 && (
          <Polyline
            path={routePath}
            options={{
              strokeColor: "#00bfff",
              strokeOpacity: 0.8,
              strokeWeight: 5,
              geodesic: true,
            }}
          />
        )}
      </GoogleMap>

      {/* Info Box */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-xl max-w-[300px] z-[1000]">
        <h2 className="text-xl font-semibold mb-2">
          {currentDelivery.status === "CONFIRMED"
            ? "Going to Restaurant"
            : "Going to Customer"}
        </h2>
        <p className="text-gray-700 mb-4 text-sm">
          {currentDelivery.status === "CONFIRMED"
            ? currentDelivery.restaurantLocation.address
            : currentDelivery.deliveryAddress.fullAddress}
        </p>
        <button
          onClick={
            currentDelivery.status === "CONFIRMED"
              ? handlePickup
              : handleCompleteDelivery
          }
          className={`py-2 px-4 w-full rounded ${
            currentDelivery.status === "CONFIRMED"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-green-600 hover:bg-green-700"
          } text-white`}
        >
          {currentDelivery.status === "CONFIRMED"
            ? "Pickup Order"
            : "Complete Delivery"}
        </button>
      </div>
    </div>
  );
}
