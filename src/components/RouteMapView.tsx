import { Geolocation } from "../shared.types";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { useRef } from "react";

type Props = {
  origin: Geolocation;
  destination: Geolocation;
  width: number;
  height: number;
};

export function RouteMapView({ origin, destination, width, height }: Props) {
  const GOOGLE_MAPS_APIKEY = "AIzaSyD39z0hIN3gG8W7HB1CnL0jsLuvZrhoJDA"; // process.env.GOOGLE_MAPS_API_KEY;
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
        ...origin,
        latitudeDelta: 5,
        longitudeDelta: 5,
      }}
      provider={PROVIDER_GOOGLE}
    >
      <Marker coordinate={origin} title="Origen" identifier="{origin}" />
      <Marker coordinate={destination} title="Destino" />

      <MapViewDirections
        origin={origin}
        destination={destination}
        apikey={GOOGLE_MAPS_APIKEY}
        strokeWidth={4}
        strokeColor="blue"
        mode="DRIVING"
        onReady={(result) => {
          // Ajusta zoom automáticamente al cargar la ruta
          mapRef.current?.fitToCoordinates(result.coordinates, {
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
