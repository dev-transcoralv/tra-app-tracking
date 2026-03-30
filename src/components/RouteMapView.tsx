import { Geolocation } from "../shared.types";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { MapViewRoute } from "react-native-maps-routes";
import { useRef } from "react";

type Props = {
  origin: Geolocation;
  destination: Geolocation;
  width: number;
  height: number;
};

export function RouteMapView({ origin, destination, width, height }: Props) {
  const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapRef = useRef<MapView>(null);

  return (
    <MapView
      ref={mapRef}
      style={{
        flex: 1,
        width: width,
        height: height,
      }}
      initialRegion={{
        latitude: origin.latitude,
        longitude: origin.longitude,
        latitudeDelta: 5,
        longitudeDelta: 5,
      }}
      provider={PROVIDER_GOOGLE}
    >
      <Marker
        coordinate={{ latitude: origin.latitude, longitude: origin.longitude }}
        title="Origen"
        identifier="origin"
      />
      <Marker
        coordinate={{
          latitude: destination.latitude,
          longitude: destination.longitude,
        }}
        title="Destino"
      />

      <MapViewRoute
        origin={{ latitude: origin.latitude, longitude: origin.longitude }}
        destination={{
          latitude: destination.latitude,
          longitude: destination.longitude,
        }}
        apiKey={GOOGLE_MAPS_APIKEY}
        strokeWidth={4}
        strokeColor="blue"
        mode="DRIVE"
        onReady={(result: any) => {
          // Ajusta zoom automáticamente al cargar la ruta
          mapRef.current?.fitToCoordinates(result, {
            edgePadding: {
              top: 50,
              right: 50,
              bottom: 50,
              left: 50,
            },
            animated: true,
          });
        }}
        onError={(errorMessage) =>
          console.error("Directions error:", errorMessage)
        }
      />
    </MapView>
  );
}
