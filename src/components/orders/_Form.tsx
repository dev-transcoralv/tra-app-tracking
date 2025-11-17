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
  StyleSheet,
} from "react-native";
import {
  Order,
  orderData,
  ReasonFakeFreight,
  ReasonReturn,
  Vehicle,
} from "../../shared.types";
import { ListGuides } from "../../components/guides/_List";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesomePlay, FontAwesomeSave, FontAwesomeStop } from "../Icons";
import Toast from "react-native-toast-message";
import {
  getListReasonFakeFreight,
  getListReasonReturn,
  startTrip,
  stopTrip,
  tripFinished,
  updateTrip,
} from "../../services/odoo/order";
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
  const [reasonFakeFreight, setReasonFakeFreight] = useState<
    ReasonFakeFreight[]
  >([]);
  const [reasonReturn, setReasonReturn] = useState<ReasonReturn[]>([]);
  // Confirm modal
  const [visibleConfirmModal, setVisibleConfirmModal] = useState(false);
  const [messageConfirmModal, setMessageConfirmModal] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState<
    () => void | Promise<void>
  >(() => () => {});
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  // Load initital masters
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
    const getReasonFakeFreight = async () => {
      try {
        const data = await getListReasonFakeFreight();
        const fetcheasonFakeFreight = data.results ?? [];
        setReasonFakeFreight(fetcheasonFakeFreight);
      } catch (err) {
        console.error(err);
      } finally {
      }
    };

    getReasonFakeFreight();
  }, []);

  useEffect(() => {
    const getReasonReturn = async () => {
      try {
        const data = await getListReasonReturn();
        const fetchReasonReturn = data.results ?? [];
        setReasonReturn(fetchReasonReturn);
      } catch (err) {
        console.error(err);
      } finally {
      }
    };

    getReasonReturn();
  }, []);

  useEffect(() => {
    setCurrentOrder(order); // Si viene un order nueva desde listado
  }, [order]);

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
        currentOrder.container_workflow === "1" &&
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
      currentOrder.container_workflow === "1"
    ) {
      if (
        !currentOrder.arrival_empty_time ||
        !currentOrder.departure_empty_time
      ) {
        throw "Registrar fechas/horas de contenedor vacío.";
      }
      if (currentOrder.has_generator) {
        if (
          currentOrder.container_workflow === "1" &&
          !currentOrder.generator_supplier_removal
        ) {
          throw "Registrar fecha/hora de retiro de generador.";
        }
      }
    }
    if (
      currentOrder.has_generator &&
      currentOrder.container_workflow === "1" &&
      !currentOrder.generator_supplier_delivery
    ) {
      throw "Registrar fecha/hora de devolución de generador.";
    }
    /*Guides*/
    if (currentOrder.business_code !== "containers") {
      validateGuides();
    } else {
      if (currentOrder.container_workflow === "3") {
        validateGuides();
      }
    }
  };

  // Submit - Save
  const handleSaveOrder = async (data: orderData) => {
    console.log(data);
    try {
      setLoadingSave(true);
      const order = await updateTrip(currentOrder.id, data);
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

  const {
    control: controlOrder,
    handleSubmit: handleSubmitOrder,
    formState: { errors: errorsOrder },
    reset: resetOrder,
    watch,
    setValue,
  } = useForm<orderData>({
    defaultValues: {
      image_container: currentOrder.image_container,
      container: currentOrder.container,
      goes_to_position_retirement: currentOrder.goes_to_position_retirement,
      chassis_id: currentOrder.chassis && currentOrder.chassis.id,
      fake_freight: currentOrder.fake_freight,
      has_adjustment_tm: currentOrder.has_adjustment_tm,
      adjustment_sacks: currentOrder.adjustment_sacks,
      reason_fake_freight_id:
        currentOrder.reason_fake_freight && currentOrder.reason_fake_freight.id,
      is_return: currentOrder.is_return,
      reason_return_id:
        currentOrder.reason_return && currentOrder.reason_return.id,
      return_burden_sacks: currentOrder.return_burden_sacks,
    },
  });

  const fakeFreight = watch("fake_freight");
  const isReturn = watch("is_return");
  const hasAdjustmentTm = watch("has_adjustment_tm");

  useEffect(() => {
    setValue("reason_fake_freight_id", null);
  });

  useEffect(() => {
    setValue("reason_return_id", null);
  });

  // Submit - TripFinished
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

  // Helpers
  const updateOrderField = (field: keyof Order, value: any) => {
    setCurrentOrder((previous) => ({
      ...previous,
      [field]: value,
    }));
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

  // Main
  return (
    <View className="w-full flex gap-1 bg-secondary-complementary p-2 rounded-xl">
      {/* Confirm Modal */}
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

      {/* Common data */}
      <RowDetail label="Cliente:" value={order.partner_name} />
      <RowDetail label="Coordinador:" value={order.coordinator_name} />
      <RowDetail label="Placa:" value={order.vehicle_name} />
      <RowDetail label="Ruta:" value={order.route_name} />
      <RowDetail label="Fecha/Hora ETA Carga:" value={order.eta_charge} />
      <RowDetail label="Fecha/Hora ETA Descarga" value={order.eta_download} />
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
      {/* Data by business */}
      {currentOrder.business_code === "containers" && (
        <View>
          <RowDetail
            label="Tipo de Contenedor:"
            value={currentOrder.container_type_value ?? ""}
          />
          <RowDetail
            label="Tipo de Operación:"
            value={currentOrder.container_type_operation_value ?? ""}
          />
          <RowDetail
            label={
              currentOrder.container_type === "import"
                ? `Puerto Carga:`
                : `Puerto Descarga:`
            }
            value={currentOrder.port_name}
          />
          <RowDetail
            label="Clase de Contenedor:"
            value={currentOrder.kind_container_name}
          />
          <RowDetail
            label="Tipo de Chasis:"
            value={currentOrder.chassis_type}
          />
          <RowDetail
            label="Patio de Vacío:"
            value={currentOrder.retreat_yard_name ?? ""}
          />
          {currentOrder.turn_date && (
            <RowDetail
              label="Fecha/Hora de Turno:"
              value={currentOrder.turn_date}
            />
          )}
          {currentOrder.has_generator && (
            <RowDetail
              label="Proveedor de Generador:"
              value={currentOrder.generator_supplier_name ?? ""}
            />
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
          <RowDetail label="Carga:" value={order.sacks_information ?? ""} />
          <View className="flex-row items-center">
            <Text className="font-semibold">Viaje Consolidado:</Text>
            <Switch
              disabled
              value={currentOrder.consolidated_trip}
              trackColor={{ false: "#9ca3af", true: "#4ade80" }}
              thumbColor={
                currentOrder.consolidated_trip ? "#16a34a" : "#f3f4f6"
              }
            />
          </View>
          <View className="flex-row items-center">
            <Text className="mr-3 font-semibold">Ajuste Toneladas</Text>
            <Controller
              control={controlOrder}
              name="has_adjustment_tm"
              rules={{ required: hasAdjustmentTm }}
              render={({ field: { value, onChange } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: "#9ca3af", true: "#4ade80" }}
                  thumbColor={value ? "#16a34a" : "#f3f4f6"}
                />
              )}
            />
            {hasAdjustmentTm && (
              <View>
                <Controller
                  control={controlOrder}
                  name="adjustment_sacks"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      keyboardType="number-pad"
                      onBlur={() => {
                        if (
                          value !== undefined &&
                          value !== null &&
                          String(value).trim() !== ""
                        ) {
                          const num = parseInt(String(value));
                          if (!isNaN(num)) {
                            onChange(num.toFixed(2));
                          }
                        }
                      }}
                      readOnly={order.trip_status === "finished"}
                      onChangeText={(val) => onChange(val)}
                      className="mx-2 w-7/12 color-secondary bg-gray-50 border rounded-xl outline-none text-sm md:text-base px-2"
                      value={value?.toString() ?? "0"}
                      placeholder="Número de sacos"
                    />
                  )}
                />
                {errorsOrder.adjustment_sacks && (
                  <Text style={styles.error}>Este campo es requerido.</Text>
                )}
              </View>
            )}
          </View>
        </View>
      )}
      {currentOrder.business_code === "gas_fuel" && (
        <View>
          <RowDetail
            label="Auxiliar:"
            value={currentOrder.driver_assistant_name ?? ""}
          />
          {currentOrder.return_date_bottle && (
            <View>
              <RowDetail
                label="Retorno Bombona:"
                value={currentOrder.return_date_bottle}
              />
              <View className="flex-row items-center">
                <Text className="mr-3 font-semibold">Bombona Entregada</Text>
                <Controller
                  control={controlOrder}
                  name="cylinder_delivered"
                  render={({ field: { value, onChange } }) => (
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      trackColor={{ false: "#9ca3af", true: "#4ade80" }}
                      thumbColor={value ? "#16a34a" : "#f3f4f6"}
                    />
                  )}
                />
              </View>
            </View>
          )}
        </View>
      )}

      {/* Data to update (General) */}
      {currentOrder.trip_status && (
        <View>
          <View className="flex-row items-center">
            <Text className="mr-3 font-semibold">Flete Falso</Text>
            <Controller
              control={controlOrder}
              name="fake_freight"
              render={({ field: { value, onChange } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: "#9ca3af", true: "#4ade80" }}
                  thumbColor={value ? "#16a34a" : "#f3f4f6"}
                />
              )}
            />
          </View>
          {fakeFreight && (
            <View className="mt-1">
              <Text className="font-semibold">Motivo Flete Falso</Text>
              <Controller
                control={controlOrder}
                name="reason_fake_freight_id"
                rules={{ required: fakeFreight }}
                render={({ field: { value, onChange } }) => (
                  <StyledDropdown
                    data={reasonFakeFreight}
                    labelField="name"
                    valueField="id"
                    // disable=
                    value={value}
                    search
                    onChange={(item) => onChange(item.id)}
                    className="w-full h-12 bg-white border border-black rounded-lg px-3"
                    placeholderStyle={{ color: "#999" }}
                  />
                )}
              />
              {errorsOrder.reason_fake_freight_id && (
                <Text style={styles.error}>Este campo es requerido.</Text>
              )}
            </View>
          )}
          <View className="flex-row items-center">
            <Text className="mr-3 font-semibold">Devolución</Text>
            <Controller
              control={controlOrder}
              name="is_return"
              render={({ field: { value, onChange } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: "#9ca3af", true: "#4ade80" }}
                  thumbColor={value ? "#16a34a" : "#f3f4f6"}
                />
              )}
            />
          </View>
          {isReturn && (
            <View className="mt-1">
              <Text className="font-semibold">Motivo Devolución</Text>
              <Controller
                control={controlOrder}
                name="reason_return_id"
                rules={{ required: isReturn }}
                render={({ field: { value, onChange } }) => (
                  <StyledDropdown
                    data={reasonReturn}
                    labelField="name"
                    valueField="id"
                    // disable=
                    value={value}
                    search
                    onChange={(item) => onChange(item.id)}
                    className="w-full h-12 bg-white border border-black rounded-lg px-3"
                    placeholderStyle={{ color: "#999" }}
                  />
                )}
              />
              {errorsOrder.reason_return_id && (
                <Text style={styles.error}>Este campo es requerido.</Text>
              )}
            </View>
          )}
          {currentOrder.business_code === "palletizing" && isReturn && (
            <View>
              <Text className="font-semibold">Sacos Devueltos</Text>
              <Controller
                control={controlOrder}
                name="return_burden_sacks"
                rules={{
                  required:
                    currentOrder.business_code === "palletizing" && isReturn,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    keyboardType="number-pad"
                    onBlur={() => {
                      if (
                        value !== undefined &&
                        value !== null &&
                        String(value).trim() !== ""
                      ) {
                        const num = parseInt(String(value));
                        if (!isNaN(num)) {
                          onChange(num.toFixed(2));
                        }
                      }
                    }}
                    readOnly={order.trip_status === "finished"}
                    onChangeText={(val) => onChange(val)}
                    className="w-full color-secondary bg-gray-50 border rounded-xl outline-none text-sm md:text-base px-2"
                    value={value?.toString() ?? "0"}
                    placeholder="Número de sacos"
                  />
                )}
              />
              {errorsOrder.return_burden_sacks && (
                <Text style={styles.error}>Este campo es requerido.</Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* Data by business (Hours) */}
      {currentOrder.trip_status && (
        <View className="flex">
          {/* Buttons Hours - Grain */}
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
          {/* Buttons Hours - Import (immediate loading) */}
          {currentOrder.business_code === "containers" &&
            currentOrder.container_type === "import" &&
            currentOrder.container_type_operation === "immediate loading" &&
            currentOrder.container_workflow === "1" && (
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
                <View className="mt-1">
                  <Text className="font-semibold">* Acople</Text>
                  <Controller
                    control={controlOrder}
                    name="chassis_id"
                    rules={{ required: true }}
                    render={({ field: { value, onChange } }) => (
                      <StyledDropdown
                        data={chassis}
                        labelField="name"
                        valueField="id"
                        placeholder="p.e B30"
                        // disable=
                        value={value}
                        search
                        onChange={(item) => onChange(item.id)}
                        className="w-full h-12 bg-white border border-black rounded-lg px-3"
                        placeholderStyle={{ color: "#999" }}
                      />
                    )}
                  />
                  {errorsOrder.chassis_id && (
                    <Text style={styles.error}>Este campo es requerido.</Text>
                  )}
                </View>

                <View className="my-1">
                  <Text className="font-semibold">* Contenedor</Text>
                  <Controller
                    control={controlOrder}
                    name="container"
                    rules={{ required: true }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        placeholder="p.e MSNU2331501"
                        placeholderTextColor="#999"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value ? String(value) : ""}
                        className="color-secondary bg-white p-2 rounded-xl w-full outline-none text-sm md:text-base border border-black"
                      />
                    )}
                  />
                  {errorsOrder.container && (
                    <Text style={styles.error}>Este campo es requerido.</Text>
                  )}
                </View>
                {currentOrder.has_generator && (
                  <View>
                    <Separator />
                    <Text className="font-extrabold text-lg color-primary underline mb-2">
                      Generador
                    </Text>
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
              </View>
            )}
          {/* Buttons Hours - Others */}
          {!["containers", "grain"].includes(currentOrder.business_code) && (
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

      {/* Moves - Only in export */}
      {currentOrder.business_code === "containers" &&
        currentOrder.container_type === "export" && (
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
        currentOrder.container_workflow === "1" && (
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

      {/* Button Save trip */}
      {["initiated", null].includes(currentOrder.trip_status) && (
        <TouchableOpacity
          className="flex-1 mb-2 px-5 py-2 items-center bg-green-500"
          onPress={handleSubmitOrder(handleSaveOrder)}
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

      {/* Button End trip */}
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
            <Text className="color-white font-semibold">Cerrar</Text>
          </TouchableOpacity>

          <RouteMapView
            origin={order.route_geolocation_origin}
            destination={order.route_geolocation_destination}
            width={screenWidth}
            height={screenHeight - 50} // leave space for close button
          />

          {/*TODO
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

const styles = StyleSheet.create({
  error: {
    color: "#e10718",
  },
});
