/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
} from "react-native";
import { Order } from "../../shared.types";
import { ListGuides } from "../../components/guides/_List";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesomePlay, FontAwesomeStop } from "../Icons";
import Toast from "react-native-toast-message";
import { startTrip, stopTrip, tripFinished } from "../../services/odoo/order";
import { DatetimeButton } from "./_DatetimeButton";
import { GrainForm } from "./_GrainForm";
import { ListObservations } from "../observations/_List";
import WhatsAppButton from "../WhatsappButton";
// import WialonLiveMap from "../WialonLiveMap";
import { ConfirmModal } from "../ConfirmModal";
import { RouteMapView } from "../RouteMapView";
import { ImagePickerField } from "../ImagePickerField";
// TODO: import { AppleMaps, GoogleMaps } from "expo-maps";
import { useForm, Controller } from "react-hook-form";

type GrainData = {
  burden_kg: number;
  tara_kg: number;
  final_burden_kg: number;
  final_tara_kg: number;
};

export function OrderForm({ order }: { order: Order }) {
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [orderIdStarted, setOrderIdStarted] = useState<number | null>(null);
  const [loadingChangeInitiated, setLoadingChangeInitiated] = useState(false);
  const [loadingTripFinished, setLoadingTripFinished] = useState(false);
  // Confirm modal
  const [visibleConfirmModal, setVisibleConfirmModal] = useState(false);
  const [messageConfirmModal, setMessageConfirmModal] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState<
    () => void | Promise<void>
  >(() => () => {});
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  useEffect(() => {
    setCurrentOrder(order); // si viene un order nuevo desde arriba
  }, [order]);

  const updateOrderField = (field: keyof Order, value: any) => {
    setCurrentOrder((previous) => ({
      ...previous,
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

  const changeInitiated = async () => {
    try {
      setLoadingChangeInitiated(true);
      if (currentOrder.trip_status !== "initiated") {
        const order = await startTrip(currentOrder.id);
        setCurrentOrder(order);
      } else {
        const order = await stopTrip(currentOrder.id);
        setCurrentOrder(order);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error,
      });
      throw error;
    } finally {
      setLoadingChangeInitiated(false);
    }
  };

  const validateFieldsTripCompleted = () => {
    if (
      !currentOrder.arrival_charge_time ||
      !currentOrder.arrival_download_time ||
      !currentOrder.departure_charge_time ||
      !currentOrder.departure_download_time
    ) {
      throw "Se deben registrar fechas/horas para finalizar.";
    }

    /*Guides*/
    const guidesThird = currentOrder.guides.filter(
      (guide) => guide.type === "third",
    );
    if (
      ["customer", "both"].includes(currentOrder.type_delivery_note) &&
      guidesThird.length === 0
    ) {
      throw "Debe ingresar al menos una guía de cliente.";
    }
    const guidesOwn = currentOrder.guides.filter(
      (guide) => guide.type === "own",
    );
    if (
      ["own", "both"].includes(currentOrder.type_delivery_note) &&
      guidesOwn.length === 0
    ) {
      throw "Debe ingresar al menos una guía propia.";
    }
    /*Validate by business*/
    if (currentOrder.business_code === "grain") {
      if (
        !currentOrder.arrival_point_charge_time ||
        !currentOrder.departure_point_charge_time ||
        !currentOrder.arrival_point_download_time ||
        !currentOrder.departure_point_download_time
      ) {
        throw "Se deben registrar fechas/horas para finalizar.";
      }
      if (
        !currentOrder.burden_kg ||
        !currentOrder.tara_kg ||
        !currentOrder.final_burden_kg ||
        !currentOrder.final_tara_kg
      ) {
        throw "Se deben registrar pesos para finalizar.";
      }
      if (
        !currentOrder.image_scale_ticket ||
        !currentOrder.final_image_scale_ticket
      ) {
        throw "Se deben registrar fotos de tickets de báscula.";
      }
    }
    if (currentOrder.business_code === "containers") {
      if (
        !currentOrder.arrival_empty_time ||
        !currentOrder.departure_empty_time
      ) {
        throw "Se deben registrar fechas/horas de contenedor vacío para finalizar.";
      }
    }
  };

  const handleTripFinished = async () => {
    try {
      validateFieldsTripCompleted();
      setLoadingTripFinished(true);
      const order = await tripFinished(currentOrder.id);
      setCurrentOrder(order);
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

  const openConfirmModal = (
    message: string,
    onConfirm: () => void | Promise<void>,
  ) => {
    setMessageConfirmModal(message);
    setOnConfirmAction(() => onConfirm);
    setVisibleConfirmModal(true);
  };

  return (
    <View className="w-full flex gap-1 bg-secondary-complementary p-2 rounded-xl">
      <ConfirmModal
        visible={visibleConfirmModal}
        message={messageConfirmModal}
        onConfirm={onConfirmAction}
        onCancel={() => setVisibleConfirmModal(false)}
      />

      {currentOrder.trip_status !== "finished" && (
        <TouchableOpacity
          className={`flex-1 px-5 py-2 items-center ${
            (currentOrder.trip_status as string) === "initiated"
              ? "bg-primary"
              : "bg-green-500"
          }`}
          onPress={() => changeInitiated()}
        >
          {loadingChangeInitiated ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View className="items-center">
              {(currentOrder.trip_status as string) === "initiated" ? (
                <FontAwesomeStop />
              ) : (
                <FontAwesomePlay color="white" />
              )}
              <Text
                className={`items-center font-extrabold ${(currentOrder.trip_status as string) === "finished" ? "color-black" : "color-white"}`}
              >
                {(currentOrder.trip_status as string) === "initiated"
                  ? "Detener"
                  : "Iniciar"}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
      <View className="flex-row">
        <Text className="font-bold">Cliente:</Text>
        <Text className="ml-2">{currentOrder.partner_name}</Text>
      </View>

      <View className="flex-row">
        <Text className="font-bold">Coordinador:</Text>
        <Text className="ml-2">{currentOrder.coordinator_name}</Text>
      </View>
      {/*order.coordinator_mobile && (
        <View className="flex-1">
          <WhatsAppButton
            phone={order.coordinator_mobile}
            message={`Tengo una duda sobre la orden no. ${order.name}`}
          />
        </View>
      )*/}
      <View className="flex-row">
        <Text className="font-bold">Placa:</Text>
        <Text className="ml-2">{currentOrder.vehicle_name}</Text>
      </View>
      <View className="flex-row">
        <Text className="font-bold">Ruta:</Text>
        <Text className="ml-2">{currentOrder.route_name}</Text>
      </View>

      <View>
        <TouchableOpacity
          className="bg-blue-900 py-3 px-4 rounded-xl items-center"
          onPress={() => setIsMapModalVisible(true)}
        >
          <Text className="items-center font-extrabold color-white">
            Ver Ruta
          </Text>
        </TouchableOpacity>
      </View>
      <View
        className="my-1 bg-secondary mx-2"
        style={{
          height: 2,
        }}
      />
      {/*Data by business containers_import_immediate_loading */}
      {currentOrder.business_code === "containers" && (
        <View>
          <View className="flex-row">
            <Text className="font-bold">Tipo de Contenedor:</Text>
            <Text className="ml-2">{currentOrder.container_type}</Text>
          </View>
          <View className="flex-row">
            <Text className="font-bold">Puerto:</Text>
            <Text className="ml-2">{currentOrder.port_name}</Text>
          </View>
          <View className="flex-row">
            <Text className="font-bold">Clase de Contenedor:</Text>
            <Text className="ml-2">{currentOrder.kind_container_name}</Text>
          </View>
          <View className="flex-row">
            <Text className="font-bold">Tipo de Chasis:</Text>
            <Text className="ml-2">{currentOrder.chassis_type}</Text>
          </View>
        </View>
      )}
      {currentOrder.business_code === "grain" && (
        <View>
          <View className="flex-row">
            <Text className="font-bold">Operación:</Text>
            <Text className="ml-2">{currentOrder.operation_name}</Text>
          </View>
          <View className="flex-row">
            <Text className="font-bold">Material:</Text>
            <Text className="ml-2">{currentOrder.material_name}</Text>
          </View>
          {currentOrder.trip_status && (
            <View>
              <Text className="font-extrabold text-lg color-primary underline mb-2">
                Registrar Pesos
              </Text>
              <GrainForm
                order={currentOrder}
                onSave={(grainData) => {
                  (Object.keys(grainData) as (keyof GrainData)[]).forEach(
                    (key) => {
                      updateOrderField(key, grainData[key]);
                    },
                  );
                }}
              />
            </View>
          )}
        </View>
      )}
      {currentOrder.business_code === "palletizing" && (
        <View>
          <View className="flex-row">
            <Text className="font-bold">Carga:</Text>
            <Text className="ml-2">{currentOrder.sacks_information}</Text>
          </View>
        </View>
      )}

      {/*Buttons*/}
      {currentOrder.trip_status && (
        <View className="flex">
          <View
            className="my-1 bg-secondary mx-2"
            style={{
              height: 2,
            }}
          />
          <Text className="font-extrabold text-lg color-primary underline mb-2">
            Registrar Fechas/Horas:
          </Text>
          {currentOrder.business_code === "grain" && (
            <View>
              <DatetimeButton
                orderId={currentOrder.id}
                field="arrival_point_download_time"
                datetime={currentOrder.arrival_point_download_time}
                title="Llegada Punto C."
                orderFinished={currentOrder.trip_status === "finished"}
                onChange={(value) =>
                  updateOrderField("arrival_point_download_time", value)
                }
              />
              {currentOrder.arrival_point_charge_time && (
                <DatetimeButton
                  orderId={currentOrder.id}
                  field="arrival_charge_time"
                  datetime={currentOrder.arrival_charge_time}
                  title="Llegada Carga"
                  orderFinished={currentOrder.trip_status === "finished"}
                  onChange={(value) =>
                    updateOrderField("arrival_charge_time", value)
                  }
                />
              )}
              {currentOrder.arrival_charge_time && (
                <DatetimeButton
                  orderId={currentOrder.id}
                  field="arrival_download_time"
                  datetime={currentOrder.arrival_download_time}
                  title="Salida Carga"
                  orderFinished={currentOrder.trip_status === "finished"}
                  onChange={(value) =>
                    updateOrderField("arrival_download_time", value)
                  }
                />
              )}
              {currentOrder.arrival_download_time && (
                <DatetimeButton
                  orderId={currentOrder.id}
                  field="departure_point_charge_time"
                  datetime={currentOrder.departure_point_charge_time}
                  title="Salida Punto C."
                  orderFinished={currentOrder.trip_status === "finished"}
                  onChange={(value) =>
                    updateOrderField("departure_point_charge_time", value)
                  }
                />
              )}
              {currentOrder.departure_point_charge_time && (
                <DatetimeButton
                  orderId={currentOrder.id}
                  field="arrival_point_download_time"
                  datetime={currentOrder.arrival_point_download_time}
                  title="Llegada Punto D."
                  orderFinished={currentOrder.trip_status === "finished"}
                  onChange={(value) =>
                    updateOrderField("arrival_point_download_time", value)
                  }
                />
              )}
              {currentOrder.arrival_point_download_time && (
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
              )}
              {currentOrder.departure_charge_time && (
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
              )}
              {currentOrder.departure_download_time && (
                <DatetimeButton
                  orderId={currentOrder.id}
                  field="departure_point_download_time"
                  datetime={currentOrder.departure_point_download_time}
                  title="Salida Punto D."
                  orderFinished={currentOrder.trip_status === "finished"}
                  onChange={(value) =>
                    updateOrderField("departure_point_download_time", value)
                  }
                />
              )}
            </View>
          )}
          {currentOrder.business_code !== "grain" && (
            <View>
              <DatetimeButton
                orderId={currentOrder.id}
                field="arrival_charge_time"
                datetime={currentOrder.arrival_charge_time}
                title="Llegada Carga"
                orderFinished={currentOrder.trip_status === "finished"}
                onChange={(value) =>
                  updateOrderField("arrival_charge_time", value)
                }
              />
              {currentOrder.arrival_charge_time && (
                <DatetimeButton
                  orderId={currentOrder.id}
                  field="arrival_download_time"
                  datetime={currentOrder.arrival_download_time}
                  title="Salida Carga"
                  orderFinished={currentOrder.trip_status === "finished"}
                  onChange={(value) =>
                    updateOrderField("arrival_download_time", value)
                  }
                />
              )}
              {currentOrder.arrival_download_time && (
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
              )}
              {currentOrder.departure_charge_time && (
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
              )}
            </View>
          )}
        </View>
      )}
      <View
        className="my-1 bg-secondary mx-2"
        style={{
          height: 2,
        }}
      />
      {/*Data by business*/}
      {currentOrder.trip_status &&
        currentOrder.business_code === "containers" && (
          <View>
            <Text className="font-extrabold text-lg color-primary underline mb-2">
              Contenedor Vacío
            </Text>
            <DatetimeButton
              orderId={currentOrder.id}
              field="arrival_empty_time"
              datetime={currentOrder.arrival_empty_time}
              title="Llegada Vacío"
              orderFinished={currentOrder.trip_status === "finished"}
              onChange={(value) =>
                updateOrderField("arrival_empty_time", value)
              }
            />
            {currentOrder.arrival_empty_time && (
              <DatetimeButton
                orderId={currentOrder.id}
                field="departure_empty_time"
                datetime={currentOrder.departure_empty_time}
                title="Salida Vacío"
                orderFinished={currentOrder.trip_status === "finished"}
                onChange={(value) =>
                  updateOrderField("departure_empty_time", value)
                }
              />
            )}
            {/* Image Container */}
            <View className="mt-2">
              <ImagePickerField
                control={control}
                name="image"
                label="Foto de Contenedor"
              />
            </View>

            <View
              className="my-1 bg-secondary mx-2"
              style={{
                height: 2,
              }}
            />
          </View>
        )}
      {/*Guides*/}
      <ListGuides
        guides={currentOrder.guides}
        order={currentOrder}
        onUpdate={(newGuides) => updateOrderField("guides", newGuides)}
        orderFinished={currentOrder.trip_status === "finished"}
      />
      <View
        className="my-1 bg-secondary mx-2"
        style={{
          height: 2,
        }}
      />
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
          onPress={() =>
            openConfirmModal("¿Quieres finalizar el viaje?", () => {
              handleTripFinished();
              setVisibleConfirmModal(false);
            })
          }
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

      {/* Map Modal */}
      <Modal
        visible={isMapModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsMapModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
          <TouchableOpacity
            onPress={() => setIsMapModalVisible(false)}
            className="bg-secondary px-5 py-3 items-center"
          >
            <Text className="text-white font-semibold">Cerrar</Text>
          </TouchableOpacity>

          <RouteMapView
            origin={order.route_geolocation_origin}
            destination={order.route_geolocation_destination}
            width={screenWidth}
            height={screenHeight - 50} // leave space for close button
          />
        </View>
      </Modal>
    </View>
  );
}
