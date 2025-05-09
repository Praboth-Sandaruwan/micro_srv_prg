import { Marker } from "@react-google-maps/api";
import React from "react";

export default function DriverMarker({ position }) {
  return (
    <Marker
      position={position}
      icon={{
        //url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        url: "https://static.vecteezy.com/system/resources/previews/019/556/250/original/sport-car-isolated-on-transparent-background-3d-rendering-illustration-free-png.png",
        scaledSize: new window.google.maps.Size(40, 40),
      }}
    />
  );
}
