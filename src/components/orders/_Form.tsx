import { useEffect, useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Order, Geolocation } from "../../shared.types";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { ListGuides } from "../../components/guides/_List";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesomePlay, FontAwesomeStop } from "../Icons";
import Toast from "react-native-toast-message";
import { startTrip } from "../../services/odoo/order";
import { DatetimeButton } from "./_DatetimeButton";

export function OrderForm({ order }: { order: Order }) {
  const ORIGIN: Geolocation = order.route_geolocation_origin;
  const DESTINATION: Geolocation = order.route_geolocation_origin;

  const [route, setRoute] = useState([]);
  const [initiated, setInitiated] = useState(false);
  const [orderIdStarted, setOrderIdStarted] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const loadSaveOrderIdStarted = async () => {
      try {
        const saveOrderIdStarted = await AsyncStorage.getItem("orderIdStarted");
        if (saveOrderIdStarted !== null) {
          setOrderIdStarted(parseInt(saveOrderIdStarted));
        }
      } catch (e) {
        console.error("Error cargando nombre", e);
      }
    };
    loadSaveOrderIdStarted();
  }, []);

  useEffect(() => {
    const saveOrderIdStarted = async () => {
      try {
        await AsyncStorage.setItem("orderIdStarted", orderIdStarted);
      } catch (error) {
        throw error;
      }
    };
    if (orderIdStarted) {
      saveOrderIdStarted();
    }
  }, [orderIdStarted]);

  const changeInitiated = async (flag: boolean) => {
    setInitiated(flag);
    try {
      setLoading(true);
      await startTrip(order.id);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="w-full flex gap-1 bg-secondary-complementary p-2 rounded-xl">
      <View className="flex-row">
        <View className="flex-1">
          <Text className="font-bold">Cliente:</Text>
          <TextInput readOnly value={order.partner_name} />
        </View>
        <View className="flex-1">
          <TouchableOpacity
            className={`flex-1 px-5 py-3 items-center rounded-full ${
              initiated ? "bg-primary" : "bg-green-500"
            }`}
            onPress={() => changeInitiated(!initiated)}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View className="items-center">
                {initiated ? <FontAwesomeStop /> : <FontAwesomePlay />}
                <Text
                  className={`items-center font-extrabold ${initiated ? "color-white" : ""}`}
                >
                  {initiated ? "Detener" : "Iniciar"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
      {/*Buttons*/}
      <View className="flex">
        <DatetimeButton
          orderId={order.id}
          field="arrival_charge_time"
          datetime={order.arrival_charge_time}
          title="Llegada Carga"
        />
        <DatetimeButton
          orderId={order.id}
          field="arrival_charge_time"
          datetime={order.arrival_download_time}
          title="Salida Carga"
        />
        <DatetimeButton
          orderId={order.id}
          field="departure_charge_time"
          datetime={order.departure_charge_time}
          title="Llegada Descarga"
        />
        <DatetimeButton
          orderId={order.id}
          field="departure_download_time"
          datetime={order.departure_download_time}
          title="Salida Descarga"
        />
      </View>
      {order.guides.length > 1 && <ListGuides guides={order.guides} />}
    </View>
  );
}
