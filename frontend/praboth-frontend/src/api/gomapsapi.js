const API_KEY = "AlzaSyh2u68c-NjkltGpZo--QvNLq5xKxMsxO3j"

export const fetchRouteFromGoMaps = async (origin, destination) => {
  const url = `https://maps.gomaps.pro/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${API_KEY}&mode=driving`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch route from GoMaps");

  const data = await response.json();
  if (!data.routes?.length) throw new Error("No route found");

  const encodedPolyline = data.routes[0].overview_polyline.points;
  const path = decodePolyline(encodedPolyline);
  return { path };
};

function decodePolyline(encoded) {
  let index = 0,
    len = encoded.length,
    lat = 0,
    lng = 0;
  const coordinates = [];

  while (index < len) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    coordinates.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return coordinates;
}

export const snapToNearestRoad = async (points) => {
  const formattedPoints = points.map((p) => `${p.lat},${p.lng}`).join("|");
  const url = `https://roads.gomaps.pro/v1/snapToRoads?path=${formattedPoints}&key=${API_KEY}&interpolate=true`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  const data = await response.json();

  if (!data.snappedPoints || data.snappedPoints.length < 2) {
    throw new Error("Insufficient snapped points");
  }
  return data.snappedPoints;
};
