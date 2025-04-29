import { Marker } from "@react-google-maps/api";
import React from "react";

export default function DriverMarker({ position }) {
  return (
    <Marker
      position={position}
      icon={{
        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        scaledSize: new window.google.maps.Size(40, 40),
      }}
    />
  );
}
