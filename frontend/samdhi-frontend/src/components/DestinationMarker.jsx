import { Marker } from "@react-google-maps/api";
import React from "react";

export default function DestinationMarker({ position }) {
  return (
    <Marker
      position={position}
      icon={{
        url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        scaledSize: new window.google.maps.Size(40, 40),
      }}
    />
  );
}
