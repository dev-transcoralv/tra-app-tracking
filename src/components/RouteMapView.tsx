import { useEffect, useState } from "react";
import { Geolocation } from "../shared.types";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import Toast from "react-native-toast-message";

type Props = {
  origin: Geolocation;
  destination: Geolocation;
  width: number;
  height: number;
};

export function RouteMapView({ origin, destination, width, height }: Props) {
  const [route, setRoute] = useState<{ latitude: number; longitude: number }[]>(
    [],
  );

  useEffect(() => {
    getRoute();
  });

  const decodePolyline = (
    t: string,
  ): { latitude: number; longitude: number }[] => {
    let points: { latitude: number; longitude: number }[] = [];
    let index = 0,
      len = t.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }

    return points;
  };

  const getRoute = async () => {
    const apiKey = "AIzaSyADL3xk4n2KfBOt5r7tYBY4zfRskOz4OvY";
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${apiKey}`;

    const response = await fetch(url);
    const json = await response.json();

    const routes = (json as { routes: any }).routes;

    if (!routes || routes.length === 0) {
      Toast.show({
        type: "error",
        text1: "No se encontró ruta en Google Maps.",
      });
      return;
    }

    if (routes.length > 0) {
      const codedPoints = routes[0].overview_polyline.points;

      const decodedPoints = decodePolyline(codedPoints);
      setRoute(decodedPoints);
    }
  };

  return (
    <MapView
      style={{
        flex: 1,
        width: width,
        height: height,
      }}
      initialRegion={{
        latitude: origin.latitude,
        longitude: origin.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      <Marker coordinate={origin} title="Origen" />
      <Marker coordinate={destination} title="Destino" />
      {route.length > 0 && (
        <Polyline coordinates={route} strokeWidth={4} strokeColor="blue" />
      )}
    </MapView>
  );
}
