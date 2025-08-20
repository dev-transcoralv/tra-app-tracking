import { useEffect, useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Order } from "../../shared.types";
import { ListGuides } from "../../components/guides/_List";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesomePlay, FontAwesomeStop } from "../Icons";
import Toast from "react-native-toast-message";
import { startTrip, tripFinished } from "../../services/odoo/order";
import { DatetimeButton } from "./_DatetimeButton";
import WhatsAppButton from "../WhatsappButton";
import { GrainForm } from "./_GrainForm";
import { RouteMapView } from "../../components/RouteMapView";

export function OrderForm({ order }: { order: Order }) {
  const [initiated, setInitiated] = useState(false);
  const [orderIdStarted, setOrderIdStarted] = useState<number | null>(null);
  const [loadingChangeInitiated, setLoadingChangeInitiated] = useState(false);
  const [loadingTripFinished, setLoadingTripFinished] = useState(false);

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

  const changeInitiated = async (flag: boolean) => {
    if (flag && orderIdStarted && order.id !== orderIdStarted) {
      Toast.show({
        type: "error",
        text1: "No puede tener dos ordenes iniciadas.",
      });
      return;
    }
    setInitiated(flag);
    try {
      setLoadingChangeInitiated(true);
      await startTrip(order.id);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error,
      });
      throw error;
    } finally {
      setLoadingChangeInitiated(false);
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
    /*Validate by business*/
    if (order.business_code === "grain") {
      if (
        !order.burden_kg ||
        !order.tara_kg ||
        !order.final_burden_kg ||
        !order.final_tara_kg
      ) {
        Toast.show({
          type: "error",
          text1: "Se deben registrar pesos para finalizar.",
        });
        return;
      }
    }
  };

  const handleTripFinished = async () => {
    validateFieldsTripCompleted();
    try {
      setLoadingTripFinished(true);
      await tripFinished(order.id);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error,
      });
      throw error;
    } finally {
      setLoadingTripFinished(false);
      removeOrderIdStarted();
    }
  };

  return (
    <View className="w-full flex gap-1 bg-secondary-complementary p-2 rounded-xl">
      {order.trip_status !== "finished" && (
        <TouchableOpacity
          className={`flex-1 px-5 py-2 items-center ${
            initiated || order.trip_status === "initiated"
              ? "bg-primary"
              : "bg-green-500"
          }`}
          onPress={() => changeInitiated(!initiated)}
        >
          {loadingChangeInitiated ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View className="items-center">
              {initiated || order.trip_status === "initiated" ? (
                <FontAwesomeStop />
              ) : (
                <FontAwesomePlay />
              )}
              <Text
                className={`items-center font-extrabold ${initiated || order.trip_status === "initiated" ? "color-white" : ""}`}
              >
                {initiated || order.trip_status === "initiated"
                  ? "Detener"
                  : "Iniciar"}
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
          editable={false}
          value={order.partner_name}
        />
      </View>

      <View className="flex-row">
        <Text className="w-1/4 font-bold align-middle">Coordinador:</Text>
        <TextInput
          className="w-7/12 align-middle"
          editable={false}
          value={order.coordinator_name}
        />
        {order.coordinator_mobile && (
          <View className="w-1/6">
            <WhatsAppButton
              phone={order.coordinator_mobile}
              message={`Tengo una duda sobre la orden no. ${order.name}`}
            />
          </View>
        )}
      </View>
      <View className="flex-row">
        <Text className="font-bold">Placa:</Text>
        <TextInput
          className="py-0"
          editable={false}
          value={order.vehicle_name}
        />
      </View>
      <View className="flex-row">
        <Text className="font-bold">Ruta:</Text>
        <TextInput
          className="py-0"
          multiline
          numberOfLines={4}
          editable={false}
          value={order.route_name}
        />
      </View>

      <View className="flex items-center">
        <RouteMapView
          origin={order.route_geolocation_origin}
          destination={order.route_geolocation_destination}
          width={300}
          height={200}
        />
      </View>
      {/*Data by business*/}
      {order.child_business_code === "containers_import_immediate_loading" && (
        <View>
          <View className="flex-row">
            <Text className="font-bold">Puerto:</Text>
            <TextInput
              className="py-0"
              editable={false}
              value={order.port_name}
            />
          </View>
          <View className="flex-row">
            <Text className="font-bold">Clase de Contenedor:</Text>
            <TextInput
              className="py-0"
              editable={false}
              value={order.kind_container_name}
            />
          </View>
          <View className="flex-row">
            <Text className="font-bold">Tipo de Chasis:</Text>
            <TextInput
              className="py-0"
              editable={false}
              value={order.chassis_type}
            />
          </View>
        </View>
      )}
      {order.business_code === "grain" && (
        <View>
          <View className="flex-row">
            <Text className="font-bold">Material:</Text>
            <TextInput
              className="py-0"
              editable={false}
              value={order.material_name}
            />
          </View>
          <Text className="font-extrabold text-lg color-primary underline mb-2">
            Registrar Pesos
          </Text>
          <GrainForm order={order} />
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
      {order.guides?.length >= 1 && <ListGuides guides={order.guides} />}
      {["initiated", null].includes(order.trip_status) && (
        <TouchableOpacity
          className="flex-1 mb-2 px-5 py-2 items-center bg-blue-900"
          onPress={() => handleTripFinished()}
        >
          {loadingTripFinished ? (
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
