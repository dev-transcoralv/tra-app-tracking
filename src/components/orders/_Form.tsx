import { useEffect, useState } from "react";
import { Text, View, TextInput } from "react-native";
import { Order, Geolocation } from "../../shared.types";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { ListGuides } from "../../components/guides/_List";

export function OrderForm({ order }: { order: Order }) {
  const ORIGIN: Geolocation = order.route_geolocation_origin;
  const DESTINATION: Geolocation = order.route_geolocation_origin;

  const [route, setRoute] = useState([]);

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
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${ORIGIN.latitude},${ORIGIN.longitude}&destination=${DESTINATION.latitude},${DESTINATION.longitude}&key=${apiKey}`;

    const response = await fetch(url);
    const json = await response.json();
    const data = (json as { data: any }).data;

    console.log(data.routes);

    if (data.routes.length > 0) {
      const codedPoints = data.routes[0].overview_polyline.points;
      const decodedPoints = decodePolyline(codedPoints);
      setRoute(decodedPoints);
    }
  };

  return (
    <View className="w-full flex gap-1 bg-secondary-complementary p-2 rounded-xl">
      <Text className="font-bold">Referencia:</Text>
      <TextInput readOnly value={order.name} />
      <Text className="font-bold">Cliente:</Text>
      <TextInput readOnly value={order.partner_name} />
      <Text className="font-bold">Ruta:</Text>
      <TextInput readOnly value={order.route_name} />
      <View className="flex items-center">
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{
            width: 300,
            height: 200,
          }}
          initialRegion={{
            latitude: ORIGIN.latitude,
            longitude: ORIGIN.longitude,
            latitudeDelta: 2,
            longitudeDelta: 2,
          }}
        >
          <Marker coordinate={ORIGIN} title="Origen" />
          <Marker coordinate={DESTINATION} title="Destino" />
          {route.length > 0 && (
            <Polyline coordinates={route} strokeWidth={4} strokeColor="blue" />
          )}
        </MapView>
      </View>
      {order.guides && <ListGuides guides={order.guides} />}
    </View>
  );
}
