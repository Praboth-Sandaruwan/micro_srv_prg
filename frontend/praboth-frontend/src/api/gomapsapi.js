// Fetch the route between origin and destination using GoMaps.pro Directions API
export const fetchRouteFromGoMaps = async (origin, destination) => {
  const API_KEY = "AlzaSyfZkXkkSns7siGU_vrkBu6iJJP8Fc_BqHc";

  const url = `https://maps.gomaps.pro/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${API_KEY}&mode=driving`;

  console.log("[GoMaps API URL]:", url);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch route from GoMaps");
  }

  const data = await response.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error("No route found");
  }

  // Extract the full path (overview_polyline) from the first route
  const encodedPolyline = data.routes[0].overview_polyline.points;

  // Decode the polyline into an array of lat/lng points
  const path = decodePolyline(encodedPolyline);

  return path;
};

// Helper function to decode polyline into lat/lng coordinates
function decodePolyline(encoded) {
  let index = 0,
    len = encoded.length;
  let lat = 0,
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
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return coordinates;
}

// Snap points to nearest roads using GoMaps.pro Roads API
export const snapToNearestRoad = async (points) => {
  const API_KEY = "AIzaSyfZkXkkSns7siGU_vrkBu6iJJP8Fc_BqHc"; // Fixed API key prefix

  const formattedPoints = points.map((p) => `${p.lat},${p.lng}`).join("|");
  const url = `https://roads.googleapis.com/v1/snapToRoads?path=${formattedPoints}&key=${API_KEY}&interpolate=true`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.snappedPoints || data.snappedPoints.length < 2) {
    throw new Error("Insufficient snapped points");
  }

  return data.snappedPoints;
};
