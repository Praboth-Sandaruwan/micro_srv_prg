import React, { useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  useLoadScript,
  Polyline,
} from "@react-google-maps/api";
import { fetchConnectedDrivers } from "../api/driverapi";
import { fetchRouteFromGoMaps, snapToNearestRoad } from "../api/gomapsapi";
import { useParams } from "react-router-dom";
import DriverMarker from "../components/DriverMarker";
import DestinationMarker from "../components/DestinationMarker";
import { samplePoints } from "../utils/MapHelper";
import { getOrderById } from "../api/ordersapi";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const libraries = ["places", "geometry"];

const GOOGLE_MAPS_API_KEY = "AIzaSyDR5IF3eFb_qb_0v-W-E299o8Z0zu_jd08";

export default function DeliveryUsr() {
  const [driverLocation, setDriverLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [order, setOrder] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [error, setError] = useState(null);
  const orderId = useParams().id;

  const intervalRef = useRef();
  const mapRef = useRef();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    const orderDataAndPolling = async () => {
      const orderData = await getOrderById(orderId);
      if (!orderData) {
        console.error("Order not found");
        return;
      }

      setOrder(orderData);

      const driverId = orderData.deliverydriverId;

      const pollDriverLocation = async () => {
        try {
          const response = await fetchConnectedDrivers();
          if (!response.data) throw new Error("Driver location fetch failed.");

          const drivers = Object.entries(response.data).map(
            ([id, location]) => ({
              driverId: id,
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
          console.error("Polling error:", error);
          setError(error.message);
        }
      };

      pollDriverLocation();
      intervalRef.current = setInterval(pollDriverLocation, 1000);
    };

    orderDataAndPolling();

    return () => clearInterval(intervalRef.current);
  }, [orderId]);

  useEffect(() => {
    if (!order) return;

    const targetLocation = order.deliveryAddress;

    setDestination({ lat: targetLocation.lat, lng: targetLocation.lng });
  }, [order]);

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
  }, [driverLocation, destination, order]);

  if (loadError)
    return (
      <div className="p-4 text-center text-red-500">
        Map load error: {loadError.message}
      </div>
    );
  if (!isLoaded) return <div className="p-4 text-center">Loading map...</div>;
  if (!order) return <div className="p-4 text-center">No active delivery.</div>;
  if (error)
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="h-[calc(100vh-4rem)] relative">
      <GoogleMap
        center={driverLocation || { lat: 0, lng: 0 }}
        zoom={14}
        mapContainerStyle={containerStyle}
        mapId=""
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
          {order.status === "CONFIRMED" &&
            "Driver is preparing to pick up your order"}
          {order.status === "PICKUP" && "Driver is going to the restaurant"}
          {order.status === "OUTFORDELIVERY" &&
            "Driver is delivering your order"}
          {order.status === "COMPLETED" && "Order delivered!"}
          {!["CONFIRMED", "PICKUP", "OUTFORDELIVERY", "COMPLETED"].includes(
            order.status
          ) && "Order status: " + order.status}
        </h2>
      </div>
    </div>
  );
}
