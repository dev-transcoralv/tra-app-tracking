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
import { ListObservations } from "../observations/_List";

export function OrderForm({ order }: { order: Order }) {
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [initiated, setInitiated] = useState(false);
  const [orderIdStarted, setOrderIdStarted] = useState<number | null>(null);
  const [loadingChangeInitiated, setLoadingChangeInitiated] = useState(false);
  const [loadingTripFinished, setLoadingTripFinished] = useState(false);

  useEffect(() => {
    setCurrentOrder(order); // si viene un order nuevo desde arriba
  }, [order]);

  const updateOrderField = (field: keyof Order, value: any) => {
    setCurrentOrder((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
    if (flag && orderIdStarted && currentOrder.id !== orderIdStarted) {
      Toast.show({
        type: "error",
        text1: "No puede tener dos ordenes iniciadas.",
      });
      return;
    }
    setInitiated(flag);
    try {
      setLoadingChangeInitiated(true);
      await startTrip(currentOrder.id);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error,
      });
      throw error;
    } finally {
      setLoadingChangeInitiated(false);
      saveOrderIdStarted(String(currentOrder.id));
    }
  };

  const validateFieldsTripCompleted = () => {
    if (
      !currentOrder.arrival_charge_time ||
      !currentOrder.arrival_download_time ||
      !currentOrder.departure_charge_time ||
      !currentOrder.departure_download_time
    ) {
      Toast.show({
        type: "error",
        text1: "Se deben registrar fechas/horas para finalizar.",
      });
      return;
    }

    if (!currentOrder.guides) {
      Toast.show({
        type: "error",
        text1: "Se deben registrar guías para finalizar.",
      });
      return;
    }
    /*Validate by business*/
    if (currentOrder.business_code === "grain") {
      if (
        !currentOrder.burden_kg ||
        !currentOrder.tara_kg ||
        !currentOrder.final_burden_kg ||
        !currentOrder.final_tara_kg
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
      await tripFinished(currentOrder.id);
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
      {currentOrder.trip_status === "finished" && (
        <TouchableOpacity
          className={`flex-1 px-5 py-2 items-center ${
            initiated || (currentOrder.trip_status as string) === "initiated"
              ? "bg-primary"
              : "bg-green-500"
          }`}
          onPress={() => changeInitiated(!initiated)}
        >
          {loadingChangeInitiated ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View className="items-center">
              {initiated ||
              (currentOrder.trip_status as string) === "initiated" ? (
                <FontAwesomeStop />
              ) : (
                <FontAwesomePlay />
              )}
              <Text
                className={`items-center font-extrabold ${initiated || (currentOrder.trip_status as string) === "initiated" ? "color-white" : ""}`}
              >
                {initiated ||
                (currentOrder.trip_status as string) === "initiated"
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
          value={currentOrder.partner_name}
        />
      </View>

      <View className="flex-row">
        <Text className="w-1/4 font-bold align-middle">Coordinador:</Text>
        <TextInput
          className="w-7/12 align-middle"
          editable={false}
          value={currentOrder.coordinator_name}
        />
        {currentOrder.coordinator_mobile && (
          <View className="w-1/6">
            <WhatsAppButton
              phone={currentOrder.coordinator_mobile}
              message={`Tengo una duda sobre la orden no. ${currentOrder.name}`}
            />
          </View>
        )}
      </View>
      <View className="flex-row">
        <Text className="font-bold">Placa:</Text>
        <TextInput
          className="py-0"
          editable={false}
          value={currentOrder.vehicle_name}
        />
      </View>
      <View className="flex-row">
        <Text className="font-bold">Ruta:</Text>
        <TextInput
          className="py-0"
          multiline
          numberOfLines={4}
          editable={false}
          value={currentOrder.route_name}
        />
      </View>

      <View className="flex items-center">
        <RouteMapView
          origin={currentOrder.route_geolocation_origin}
          destination={currentOrder.route_geolocation_destination}
          width={300}
          height={200}
        />
      </View>
      {/*Data by business*/}
      {currentOrder.child_business_code ===
        "containers_import_immediate_loading" && (
        <View>
          <View className="flex-row">
            <Text className="font-bold">Puerto:</Text>
            <TextInput
              className="py-0"
              editable={false}
              value={currentOrder.port_name}
            />
          </View>
          <View className="flex-row">
            <Text className="font-bold">Clase de Contenedor:</Text>
            <TextInput
              className="py-0"
              editable={false}
              value={currentOrder.kind_container_name}
            />
          </View>
          <View className="flex-row">
            <Text className="font-bold">Tipo de Chasis:</Text>
            <TextInput
              className="py-0"
              editable={false}
              value={currentOrder.chassis_type}
            />
          </View>
        </View>
      )}
      {currentOrder.business_code === "grain" && (
        <View>
          <View className="flex-row">
            <Text className="font-bold">Material:</Text>
            <TextInput
              className="py-0"
              editable={false}
              value={currentOrder.material_name}
            />
          </View>
          <Text className="font-extrabold text-lg color-primary underline mb-2">
            Registrar Pesos
          </Text>
          <GrainForm order={currentOrder} />
        </View>
      )}

      {/*Buttons*/}
      {currentOrder.trip_status && (
        <View className="flex">
          <Text className="font-extrabold text-lg color-primary underline mb-2">
            Registrar Fechas/Horas:
          </Text>
          <DatetimeButton
            orderId={currentOrder.id}
            field="arrival_charge_time"
            datetime={currentOrder.arrival_charge_time}
            title="Llegada Carga"
            orderFinished={currentOrder.trip_status === "finished"}
            onChange={(value) => updateOrderField("arrival_charge_time", value)}
          />
          <DatetimeButton
            orderId={currentOrder.id}
            field="arrival_charge_time"
            datetime={currentOrder.arrival_download_time}
            title="Salida Carga"
            orderFinished={currentOrder.trip_status === "finished"}
            onChange={(value) =>
              updateOrderField("arrival_download_time", value)
            }
          />
          <DatetimeButton
            orderId={currentOrder.id}
            field="departure_charge_time"
            datetime={currentOrder.departure_charge_time}
            title="Llegada Descarga"
            orderFinished={currentOrder.trip_status === "finished"}
            onChange={(value) =>
              updateOrderField("departure_charge_time", value)
            }
          />
          <DatetimeButton
            orderId={currentOrder.id}
            field="departure_download_time"
            datetime={currentOrder.departure_download_time}
            title="Salida Descarga"
            orderFinished={currentOrder.trip_status === "finished"}
            onChange={(value) =>
              updateOrderField("departure_download_time", value)
            }
          />
        </View>
      )}
      {/*Buttons*/}
      {currentOrder.guides?.length >= 1 && (
        <ListGuides guides={currentOrder.guides} />
      )}
      {/*Observations*/}
      <ListObservations
        observations={currentOrder.observations}
        order={currentOrder}
        onUpdate={(newObservations) =>
          updateOrderField("observations", newObservations)
        }
        orderFinished={currentOrder.trip_status === "finished"}
      />
      {["initiated", null].includes(currentOrder.trip_status) && (
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
