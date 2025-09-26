/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
  TextInput,
  Switch,
} from "react-native";
import { Order, Vehicle } from "../../shared.types";
import { ListGuides } from "../../components/guides/_List";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesomePlay, FontAwesomeSave, FontAwesomeStop } from "../Icons";
import Toast from "react-native-toast-message";
import { startTrip, stopTrip, tripFinished } from "../../services/odoo/order";
import { DatetimeButton } from "./_DatetimeButton";
import { GrainForm } from "./_GrainForm";
import { ListObservations } from "../observations/_List";
import WhatsAppButton from "../WhatsappButton";
import WialonLiveMap from "../WialonLiveMap";
import { ConfirmModal } from "../ConfirmModal";
import { RouteMapView } from "../RouteMapView";
import { ImagePickerField } from "../ImagePickerField";
// TODO: import { AppleMaps, GoogleMaps } from "expo-maps";
import { Dropdown } from "react-native-element-dropdown";
import { cssInterop } from "nativewind";
import { useForm, Controller } from "react-hook-form";
import { getListChassis } from "../../services/odoo/vehicle";
import { ListMoves } from "../moves/_List";

type GrainData = {
  burden_kg: number;
  tara_kg: number;
  final_burden_kg: number;
  final_tara_kg: number;
};

const StyledDropdown = cssInterop(Dropdown, {
  className: "style",
});

export function OrderForm({ order }: { order: Order }) {
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [orderIdStarted, setOrderIdStarted] = useState<number | null>(null);
  const [loadingChangeInitiated, setLoadingChangeInitiated] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingTripFinished, setLoadingTripFinished] = useState(false);
  const [chassis, setChassis] = useState<Vehicle[]>([]);
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
    const getChassis = async () => {
      try {
        const data = await getListChassis("containers");
        const fetchChassis = data.results ?? [];
        setChassis(fetchChassis);
      } catch (err) {
        console.error(err);
      } finally {
      }
    };

    getChassis();
  }, []);

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

  const validateGuides = () => {
    const guidesThird = currentOrder.guides.filter(
      (guide) => guide.type === "third",
    );
    if (
      ["customer", "both"].includes(currentOrder.type_delivery_note) &&
      guidesThird.length === 0
    ) {
      throw "Ingresar al menos una guía de cliente.";
    }
    const guidesOwn = currentOrder.guides.filter(
      (guide) => guide.type === "own",
    );
    if (
      ["own", "both"].includes(currentOrder.type_delivery_note) &&
      guidesOwn.length === 0
    ) {
      throw "Ingresar al menos una guía propia.";
    }
  };

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
      currentOrder.business_code !== "containers" &&
      (!currentOrder.arrival_charge_time ||
        !currentOrder.arrival_download_time ||
        !currentOrder.departure_charge_time ||
        !currentOrder.departure_download_time)
    ) {
      throw "Registrar fechas/horas.";
    } else {
      if (
        currentOrder.container_workflow === "process" &&
        (!currentOrder.arrival_charge_time ||
          !currentOrder.arrival_download_time ||
          !currentOrder.departure_charge_time ||
          !currentOrder.departure_download_time)
      ) {
        throw "Registrar fechas/horas.";
      }
    }

    /*Validate by business*/
    if (currentOrder.business_code === "grain") {
      if (
        !currentOrder.arrival_point_charge_time ||
        !currentOrder.departure_point_charge_time ||
        !currentOrder.arrival_point_download_time ||
        !currentOrder.departure_point_download_time
      ) {
        throw "Rgistrar fechas/horas.";
      }
      if (
        !currentOrder.burden_kg ||
        !currentOrder.tara_kg ||
        !currentOrder.final_burden_kg ||
        !currentOrder.final_tara_kg
      ) {
        throw "Registrar pesos.";
      }
      if (
        !currentOrder.image_scale_ticket ||
        !currentOrder.final_image_scale_ticket
      ) {
        throw "Registrar fotos de tickets de báscula.";
      }
    }
    if (
      currentOrder.business_code === "containers" &&
      currentOrder.container_workflow === "container"
    ) {
      if (
        !currentOrder.arrival_empty_time ||
        !currentOrder.departure_empty_time
      ) {
        throw "Registrar fechas/horas de contenedor vacío.";
      }
      if (currentOrder.has_generator) {
        if (
          currentOrder.container_workflow === "container" &&
          !currentOrder.generator_supplier_removal
        ) {
          throw "Registrar fecha/hora de retiro de generador.";
        }
      }
    }
    if (
      currentOrder.has_generator &&
      currentOrder.container_workflow === "process" &&
      !currentOrder.generator_supplier_delivery
    ) {
      throw "Registrar fecha/hora de devolución de generador.";
    }
    /*Guides*/
    if (currentOrder.business_code !== "containers") {
      validateGuides();
    } else {
      if (currentOrder.container_workflow === "process") {
        validateGuides();
      }
    }
  };

  const handleSave = async () => {
    try {
      validateFieldsTripCompleted();
      setLoadingSave(true);
      const order = await tripFinished(currentOrder.id);
      setCurrentOrder(order);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error,
      });
      throw error;
    } finally {
      setLoadingSave(false);
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

  const Separator = () => {
    return <View className="my-1 bg-secondary mx-2" style={{ height: 2 }} />;
  };

  const RowDetail = ({ label, value }: { label: string; value?: string }) => {
    return (
      <View className="flex-row">
        <Text className="font-bold">{label}</Text>
        <Text className="ml-2">{value}</Text>
      </View>
    );
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
                  ? "DETENER"
                  : "INICIAR"}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
      <RowDetail label="Cliente:" value={order.partner_name} />
      <RowDetail label="Coordinador:" value={order.coordinator_name} />
      <RowDetail label="Placa:" value={order.vehicle_name} />
      <RowDetail label="Ruta:" value={order.route_name} />
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
      <Separator />
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
          {currentOrder.container_workflow === "container" && (
            <View>
              <View className="flex-row">
                <Text className="font-bold">Patio de Vacío:</Text>
                <Text className="ml-2">{currentOrder.retreat_yard_name}</Text>
              </View>
              <View className="flex-row">
                <Text className="font-bold">Fecha/Hora de Turno:</Text>
                <Text className="ml-2">{currentOrder.turn_date}</Text>
              </View>
            </View>
          )}
        </View>
      )}
      {currentOrder.business_code === "grain" && (
        <View>
          <RowDetail label="Operación:" value={order.operation_name} />
          <RowDetail label="Material:" value={order.material_name} />
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
      {currentOrder.business_code === "gas_fuel" && (
        <View>
          <View className="flex-row">
            <Text className="font-bold">Auxiliar:</Text>
            <Text className="ml-2">{currentOrder.driver_assistant_name}</Text>
          </View>
        </View>
      )}

      {/*Buttons*/}
      {currentOrder.trip_status && (
        <View className="flex">
          {currentOrder.business_code !== "containers" && (
            <View>
              <Separator />
              <Text className="font-extrabold text-lg color-primary underline mb-2">
                Registrar Fechas/Horas:
              </Text>
            </View>
          )}
          {currentOrder.business_code === "grain" && (
            <View>
              <DatetimeButton
                orderId={currentOrder.id}
                field="arrival_point_charge_time"
                datetime={currentOrder.arrival_point_charge_time}
                title="Llegada Punto C."
                orderFinished={currentOrder.trip_status === "finished"}
                onChange={(value) =>
                  updateOrderField("arrival_point_charge_time", value)
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
                  field="departure_charge_time"
                  datetime={currentOrder.departure_charge_time}
                  title="Salida Carga"
                  orderFinished={currentOrder.trip_status === "finished"}
                  onChange={(value) =>
                    updateOrderField("departure_charge_time", value)
                  }
                />
              )}
              {currentOrder.departure_charge_time && (
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
                  field="arrival_download_time"
                  datetime={currentOrder.arrival_download_time}
                  title="Llegada Descarga"
                  orderFinished={currentOrder.trip_status === "finished"}
                  onChange={(value) =>
                    updateOrderField("arrival_download_time", value)
                  }
                />
              )}
              {currentOrder.arrival_download_time && (
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
          {currentOrder.business_code === "containers" &&
            currentOrder.container_workflow === "process" && (
              <View>
                <Separator />
                <Text className="font-extrabold text-lg color-primary underline mb-2">
                  Registrar Fechas/Horas:
                </Text>
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
                    field="departure_charge_time"
                    datetime={currentOrder.departure_charge_time}
                    title="Salida Carga"
                    orderFinished={currentOrder.trip_status === "finished"}
                    onChange={(value) =>
                      updateOrderField("departure_charge_time", value)
                    }
                  />
                )}
                {currentOrder.departure_charge_time && (
                  <DatetimeButton
                    orderId={currentOrder.id}
                    field="arrival_download_time"
                    datetime={currentOrder.arrival_download_time}
                    title="Llegada Descarga"
                    orderFinished={currentOrder.trip_status === "finished"}
                    onChange={(value) =>
                      updateOrderField("arrival_download_time", value)
                    }
                  />
                )}
                {currentOrder.arrival_download_time && (
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
          {!["containers", "grain"].includes(currentOrder.business_code) && (
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
      <Separator />
      {/*Data by business*/}
      {currentOrder.trip_status &&
        currentOrder.business_code === "containers" && (
          <View>
            {currentOrder.container_workflow === "container" && (
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
                <View>
                  <ImagePickerField
                    control={control}
                    name="image"
                    label="* Foto de Contenedor"
                  />
                </View>
              </View>
            )}

            {currentOrder.container_workflow === "container" && (
              <View className="mt-1">
                <Text className="font-semibold">* Acople</Text>
                <StyledDropdown
                  data={chassis}
                  labelField="name"
                  valueField="id"
                  placeholder="p.e B30"
                  // disable=
                  value={1}
                  search
                  onChange={(item) => {}}
                  className="w-full h-12 bg-white border border-black rounded-lg px-3"
                  placeholderStyle={{ color: "#999" }}
                />
              </View>
            )}

            {currentOrder.container_workflow === "container" && (
              <View className="my-1">
                <Text className="font-semibold">* Contenedor</Text>
                <TextInput
                  placeholder="p.e MSNU2331501"
                  placeholderTextColor="#999"
                  className="color-secondary bg-white p-2 rounded-xl w-full outline-none text-sm md:text-base border border-black"
                />
              </View>
            )}
            {currentOrder.container_workflow === "container" &&
              currentOrder.container_type_operation === "immediate loading" && (
                <View className="my-1 flex-row items-center justify-between">
                  <Text className="font-semibold">
                    Pasa a Posición y Retiro
                  </Text>
                  <Switch value={currentOrder.goes_to_position_retirement} />
                </View>
              )}

            {currentOrder.has_generator &&
              currentOrder.container_workflow === "container" && (
                <View>
                  <Separator />
                  <Text className="font-extrabold text-lg color-primary underline mb-2">
                    Generador
                  </Text>
                  <DatetimeButton
                    orderId={currentOrder.id}
                    field="generator_supplier_removal"
                    datetime={currentOrder.generator_supplier_removal}
                    title="Retiro Generador"
                    orderFinished={currentOrder.trip_status === "finished"}
                    onChange={(value) =>
                      updateOrderField("generator_supplier_removal", value)
                    }
                  />
                </View>
              )}

            {currentOrder.has_generator &&
              currentOrder.container_workflow === "process" && (
                <View>
                  <DatetimeButton
                    orderId={currentOrder.id}
                    field="generator_supplier_delivery"
                    datetime={currentOrder.generator_supplier_delivery}
                    title="Entrega Generador"
                    orderFinished={currentOrder.trip_status === "finished"}
                    onChange={(value) =>
                      updateOrderField("generator_supplier_delivery", value)
                    }
                  />
                </View>
              )}

            <Separator />
          </View>
        )}

      {/*Moves*/}
      {currentOrder.business_code === "containers" &&
        currentOrder.container_workflow === "process" && (
          <View>
            <ListMoves
              moves={currentOrder.moves}
              order={currentOrder}
              onUpdate={(newMoves) => updateOrderField("moves", newMoves)}
              orderFinished={currentOrder.trip_status === "finished"}
            />
            <Separator />
          </View>
        )}
      {/*Guides*/}
      {currentOrder.business_code !== "containers" && (
        <View>
          <ListGuides
            guides={currentOrder.guides}
            order={currentOrder}
            onUpdate={(newGuides) => updateOrderField("guides", newGuides)}
            orderFinished={currentOrder.trip_status === "finished"}
          />
          <Separator />
        </View>
      )}
      {currentOrder.business_code === "containers" &&
        currentOrder.container_workflow === "process" && (
          <View>
            <ListGuides
              guides={currentOrder.guides}
              order={currentOrder}
              onUpdate={(newGuides) => updateOrderField("guides", newGuides)}
              orderFinished={currentOrder.trip_status === "finished"}
            />
            <Separator />
          </View>
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
          className="flex-1 mb-2 px-5 py-2 items-center bg-primary"
          onPress={handleSave}
        >
          {loadingSave ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View className="items-center">
              <FontAwesomeSave />
              <Text className="items-center font-extrabold color-white">
                GUARDAR
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}

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
                FINALIZAR
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

          {/*
          <WialonLiveMap
            unitName={order.vehicle_name}
            destination={order.route_geolocation_destination}
          />
          */}
        </View>
      </Modal>
    </View>
  );
}
