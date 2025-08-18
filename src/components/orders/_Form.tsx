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
import { startTrip, tripFinished } from "../../services/odoo/order";
import { DatetimeButton } from "./_DatetimeButton";

export function OrderForm({ order }: { order: Order }) {
  const ORIGIN: Geolocation = order.route_geolocation_origin;
  const DESTINATION: Geolocation = order.route_geolocation_destination;

  const [route, setRoute] = useState<{ latitude: number; longitude: number }[]>(
    [],
  );
  const [initiated, setInitiated] = useState(false);
  const [orderIdStarted, setOrderIdStarted] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getRoute();
  });

  const loadSaveOrderIdStarted = async () => {
    try {
      const saveOrderIdStarted = await AsyncStorage.getItem("orderIdStarted");
      if (saveOrderIdStarted !== null) {
        setOrderIdStarted(parseInt(saveOrderIdStarted));
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    loadSaveOrderIdStarted();
  }, []);

  const saveOrderIdStarted = async (orderId: string) => {
    try {
      await AsyncStorage.setItem("orderIdStarted", orderId);
    } catch (error) {
      throw error;
    }
  };

  const removeOrderIdStarted = async () => {
    try {
      await AsyncStorage.removeItem("orderIdStarted");
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (orderIdStarted) {
      saveOrderIdStarted(String(orderIdStarted));
    }
  }, [orderIdStarted]);

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

    const routes = (json as { routes: any }).routes;

    if (routes.length > 0) {
      const codedPoints = routes[0].overview_polyline.points;

      const decodedPoints = decodePolyline(codedPoints);
      setRoute(decodedPoints);
    }
  };

  const changeInitiated = async (flag: boolean) => {
    if (flag && order.id !== orderIdStarted) {
      Toast.show({
        type: "error",
        text1: "No puede tener dos ordenes iniciadas.",
      });
      return;
    }
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
      saveOrderIdStarted(String(order.id));
    }
  };

  const validateFieldsTripCompleted = () => {
    if (
      !order.arrival_charge_time ||
      !order.arrival_download_time ||
      !order.departure_charge_time ||
      !order.departure_download_time
    ) {
      Toast.show({
        type: "error",
        text1: "Se deben registrar fechas/horas para finalizar.",
      });
      return;
    }

    if (!order.guides) {
      Toast.show({
        type: "error",
        text1: "Se deben registrar guías para finalizar.",
      });
      return;
    }
  };

  const handleTripFinished = async () => {
    validateFieldsTripCompleted();
    try {
      setLoading(true);
      await tripFinished(order.id);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error,
      });
      throw error;
    } finally {
      setLoading(false);
      removeOrderIdStarted();
    }
  };

  return (
    <View className="w-full flex gap-1 bg-secondary-complementary p-2 rounded-xl">
      {order.trip_status !== "finished" && (
        <TouchableOpacity
          className={`flex-1 px-5 py-2 items-center ${
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
      )}
      <View className="flex-row">
        <Text className="font-bold">Cliente:</Text>
        <TextInput
          className="py-0"
          multiline
          numberOfLines={4}
          readOnly
          value={order.partner_name}
        />
      </View>

      <View className="flex-row">
        <Text className="font-bold">Coordinador:</Text>
        <TextInput
          className="py-0"
          multiline
          numberOfLines={4}
          readOnly
          value={order.coordinator_name}
        />
      </View>
      <View className="flex-row">
        <Text className="font-bold">Placa:</Text>
        <TextInput className="py-0" readOnly value={order.vehicle_name} />
      </View>
      <View className="flex-row">
        <Text className="font-bold">Ruta:</Text>
        <TextInput
          className="py-0"
          multiline
          numberOfLines={4}
          readOnly
          value={order.route_name}
        />
      </View>

      <View className="flex items-center">
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{
            flex: 1,
            width: 300,
            height: 200,
          }}
          initialRegion={{
            latitude: ORIGIN.latitude,
            longitude: ORIGIN.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={ORIGIN} title="Origen" />
          <Marker coordinate={DESTINATION} title="Destino" />
          {route.length > 0 && (
            <Polyline coordinates={route} strokeWidth={4} strokeColor="blue" />
          )}
        </MapView>
      </View>
      {/*Data by business*/}
      {order.child_business_code === "containers_import_immediate_loading" && (
        <View>
          <View className="flex-row">
            <Text className="font-bold">Puerto:</Text>
            <TextInput className="py-0" readOnly value={order.port_name} />
          </View>
          <View className="flex-row">
            <Text className="font-bold">Clase de Contenedor:</Text>
            <TextInput
              className="py-0"
              readOnly
              value={order.kind_container_name}
            />
          </View>
          <View className="flex-row">
            <Text className="font-bold">Tipo de Chasis:</Text>
            <TextInput className="py-0" readOnly value={order.chassis_type} />
          </View>
        </View>
      )}

      {/*Buttons*/}
      {order.trip_status && (
        <View className="flex">
          <Text className="font-extrabold text-lg color-primary underline mb-2">
            Registrar Fechas/Horas:
          </Text>
          <DatetimeButton
            orderId={order.id}
            field="arrival_charge_time"
            datetime={order.arrival_charge_time}
            title="Llegada Carga"
            showButton={order.trip_status !== "finished"}
          />
          <DatetimeButton
            orderId={order.id}
            field="arrival_charge_time"
            datetime={order.arrival_download_time}
            title="Salida Carga"
            showButton={order.trip_status !== "finished"}
          />
          <DatetimeButton
            orderId={order.id}
            field="departure_charge_time"
            datetime={order.departure_charge_time}
            title="Llegada Descarga"
            showButton={order.trip_status !== "finished"}
          />
          <DatetimeButton
            orderId={order.id}
            field="departure_download_time"
            datetime={order.departure_download_time}
            title="Salida Descarga"
            showButton={order.trip_status !== "finished"}
          />
        </View>
      )}
      {order.guides.length > 1 && <ListGuides guides={order.guides} />}
      {["initiated", null].includes(order.trip_status) && (
        <TouchableOpacity
          className="flex-1 mb-2 px-5 py-2 items-center bg-blue-900"
          onPress={() => handleTripFinished()}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View className="items-center">
              <FontAwesomeStop />
              <Text className="items-center font-extrabold color-white">
                Finalizar
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
