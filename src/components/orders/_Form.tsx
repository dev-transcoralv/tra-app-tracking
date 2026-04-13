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
import { ListObservations } from "../observations/_List";
import WhatsAppButton from "../WhatsappButton";
import WialonLiveMap from "../WialonLiveMap";
import { ConfirmModal } from "../ConfirmModal";
import { RouteMapView } from "../RouteMapView";
import { ImagePickerField } from "../ImagePickerField";
import { Dropdown } from "react-native-element-dropdown";
import { cssInterop } from "nativewind";
import { useForm, Controller } from "react-hook-form";
import { getListChassis } from "../../services/odoo/vehicle";
import { Picker } from "@react-native-picker/picker";
import { ListMoves } from "../moves/_List";
import { DatetimeButtonWialon } from "./_DatetimeButtonWialon";

const StyledPicker = cssInterop(Picker, {
  className: "style",
});

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
        text1: error?.message || String(error),
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
        throw "Registrar fechas/horas.";
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
    try {
      setLoadingSave(true);
      const order = await updateTrip(currentOrder.id, data);
      setCurrentOrder(order);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error?.message || String(error),
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
      burden_kg: currentOrder.burden_kg || 0,
      tara_kg: currentOrder.tara_kg || 0,
      final_burden_kg: currentOrder.final_burden_kg || 0,
      final_tara_kg: currentOrder.final_tara_kg || 0,
      image_scale_ticket: currentOrder.image_scale_ticket,
      final_image_scale_ticket: currentOrder.final_image_scale_ticket,
    },
  });

  const fakeFreight = watch("fake_freight");
  const isReturn = watch("is_return");
  const typeReturnBurdenSacks = watch("type_return_burden_sacks");
  const hasAdjustmentTm = watch("has_adjustment_tm");

  useEffect(() => {
    if (!fakeFreight) {
      setValue("reason_fake_freight_id", null, { shouldValidate: false });
    }
  }, [fakeFreight, setValue]);

  useEffect(() => {
    if (!isReturn) {
      setValue("reason_return_id", null, { shouldValidate: false });
      setValue("type_return_burden_sacks", null, { shouldValidate: false });
      setValue("return_burden_sacks", 0, { shouldValidate: false });
    }
  }, [isReturn, setValue]);

  useEffect(() => {
    if (!hasAdjustmentTm) {
      setValue("adjustment_sacks", 0, { shouldValidate: false });
    }
  }, [hasAdjustmentTm, setValue]);

  // Submit - TripFinished
  const handleTripFinished = async () => {
    try {
      if (!currentOrder.fake_freight && !currentOrder.is_return) {
        validateFieldsTripCompleted();
      }
      setLoadingTripFinished(true);
      const order = await tripFinished(currentOrder.id);
      setCurrentOrder(order);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error?.message || String(error),
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
    return <View className="my-4 bg-gray-100 mx-2" style={{ height: 1 }} />;
  };

  const ListItem = ({ label }: { label: string }) => {
    return (
      <View className="flex-row items-start bg-slate-50 py-2 px-3 rounded-xl mb-1.5 mx-2">
        <View className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-2.5" />
        <Text className="text-sm font-semibold color-gray-800 flex-1">
          {label}
        </Text>
      </View>
    );
  };

  const RowDetail = ({ label, value }: { label: string; value?: string }) => {
    return (
      <View className="flex-row items-start justify-between py-2.5 border-b border-gray-100 mx-2">
        <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest w-5/12 pt-0.5">
          {label}
        </Text>
        <Text className="text-gray-900 font-semibold text-sm w-7/12 text-right">
          {value}
        </Text>
      </View>
    );
  };

  const ControllerDecimalInput = ({
    name,
    label,
  }: {
    name: keyof orderData;
    label: string;
  }) => (
    <View>
      <View className="flex-row mt-2">
        <Text className="w-1/4 font-bold align-middle">{label}:</Text>
        <Controller
          control={controlOrder}
          name={name}
          rules={{
            // 1. Handle Requirement
            required: {
              value:
                !currentOrder.trip_status &&
                currentOrder.business_code === "grain",
              message: "Valor es requerido.",
            },
            // 2. Handle "Zero" check specifically
            validate: (value) => {
              // If the field is empty, let 'required' handle it.
              // If it has a value, convert to float and check if > 0.
              if (!value) return true;
              return parseFloat(String(value)) > 0 || "Valor no puede ser 0.";
            },
          }}
          render={({ field: { onChange, onBlur: onBlurRHF, value } }) => (
            <TextInput
              keyboardType="decimal-pad"
              onBlur={() => {
                // Your Formatting Logic
                if (
                  value !== undefined &&
                  value !== null &&
                  String(value).trim() !== ""
                ) {
                  const num = parseFloat(String(value));
                  if (!isNaN(num)) {
                    onChange(num.toFixed(2));
                  }
                }

                // CRITICAL FIX: Call the React Hook Form onBlur
                // This ensures the form knows validation should run now.
                onBlurRHF();
              }}
              readOnly={currentOrder.trip_status === "finished"}
              onChangeText={(val) => onChange(val)}
              // Add red border on error
              className={`mx-2 w-7/12 color-secondary bg-gray-50 border rounded-xl outline-none text-sm md:text-base px-2 ${
                errorsOrder[name] ? "border-red-500" : "border-gray-200"
              }`}
              value={value?.toString() ?? "0.00"}
              placeholder="0.00"
            />
          )}
        />
        <Text className="w-1/6 font-bold align-middle">/Kg</Text>
      </View>

      {/* Error Message Display */}
      {errorsOrder[name] && (
        <Text style={styles.error}>{errorsOrder[name]?.message}</Text>
      )}
    </View>
  );

  // Main
  return (
    <View className="w-full flex gap-1 bg-white p-2 rounded-[32px] shadow-sm mb-4">
      {/* Confirm Modal */}
      <ConfirmModal
        visible={visibleConfirmModal}
        message={messageConfirmModal}
        onConfirm={onConfirmAction}
        onCancel={() => setVisibleConfirmModal(false)}
      />

      {currentOrder.trip_status !== "finished" && (
        <TouchableOpacity
          className={`flex-1 px-5 py-4 items-center justify-center rounded-2xl mx-2 shadow-sm ${
            (currentOrder.trip_status as string) === "initiated"
              ? "bg-red-50 border border-red-100"
              : "bg-emerald-500"
          }`}
          onPress={() => changeInitiated()}
        >
          {loadingChangeInitiated ? (
            <ActivityIndicator
              color={
                (currentOrder.trip_status as string) === "initiated"
                  ? "#ef4444"
                  : "#ffffff"
              }
            />
          ) : (
            <View className="items-center flex-row gap-2">
              {(currentOrder.trip_status as string) === "initiated" ? (
                <FontAwesomeStop color="#ef4444" size={18} />
              ) : (
                <FontAwesomePlay color="white" size={18} />
              )}
              <Text
                className={`font-extrabold uppercase tracking-widest text-sm ${(currentOrder.trip_status as string) === "initiated" ? "color-red-600" : "color-white"}`}
              >
                {(currentOrder.trip_status as string) === "initiated"
                  ? "DETENER EL VIAJE"
                  : "INICIAR EL VIAJE"}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {currentOrder.trip_status === "finished" && (
        <View className="flex-row justify-end mx-2 mt-2">
          <View className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full z-10 shadow-sm flex-row items-center">
            <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
            <Text className="color-emerald-700 text-[10px] uppercase tracking-widest font-bold">
              Finalizado
            </Text>
          </View>
        </View>
      )}

      {/* Common data */}
      <RowDetail label="Cliente:" value={order.partner_name} />
      <RowDetail label="Coordinador:" value={order.coordinator_name} />
      <RowDetail label="Placa:" value={order.vehicle_name} />
      {!currentOrder.consolidated_trip && (
        <RowDetail label="Ruta:" value={order.route_name} />
      )}
      {currentOrder.consolidated_trip && (
        <View>
          <Text className="font-bold">Rutas:</Text>
          <ListItem label={currentOrder.route_name} />
          <ListItem label={currentOrder.route_2_name ?? ""} />
        </View>
      )}
      <RowDetail label="Fecha/Hora ETA Carga:" value={order.eta_charge} />
      <RowDetail label="Fecha/Hora ETA Descarga" value={order.eta_download} />
      {order.information && (
        <RowDetail label="Información:" value={order.information} />
      )}
      <View className="mt-2 mx-2">
        <TouchableOpacity
          className="bg-blue-50 border border-blue-100 py-3.5 px-4 rounded-xl items-center active:bg-blue-100"
          onPress={() => setIsMapModalVisible(true)}
        >
          <Text className="items-center font-bold uppercase tracking-widest text-xs color-blue-600">
            📍 Ver Mapa de Ruta
          </Text>
        </TouchableOpacity>
      </View>
      <Separator />
      {/* Data to update (General) */}
      {!currentOrder.not_need_chassis && (
        <View className="mt-1">
          <Text className="font-semibold">Acople</Text>
          <Controller
            control={controlOrder}
            name="chassis_id"
            rules={{
              required: !currentOrder.not_need_chassis,
            }}
            render={({ field: { value, onChange } }) => (
              <StyledDropdown
                data={chassis}
                labelField="name"
                valueField="id"
                placeholder="p.e B30"
                disable={currentOrder.trip_status === "finished"}
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
      )}
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
                  disabled={currentOrder.trip_status === "finished"}
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
                    disable={currentOrder.trip_status === "finished"}
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
                  disabled={currentOrder.trip_status === "finished"}
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
                    disable={currentOrder.trip_status === "finished"}
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
              <View>
                <Text className="font-semibold">Tipo:</Text>
                <Controller
                  control={controlOrder}
                  rules={{
                    required:
                      currentOrder.business_code === "palletizing" && isReturn,
                  }}
                  name="type_return_burden_sacks"
                  render={({ field: { onChange, value } }) => (
                    <StyledPicker
                      selectedValue={value}
                      onValueChange={(itemValue) => onChange(itemValue)}
                      className="bg-secondary-complementary"
                    >
                      <Picker.Item label="Completo" value="complete" />
                      <Picker.Item label="Parcial" value="partial" />
                    </StyledPicker>
                  )}
                />
              </View>
              {typeReturnBurdenSacks === "partial" && (
                <View>
                  <Text className="font-semibold">Sacos Devueltos</Text>
                  <Controller
                    control={controlOrder}
                    name="return_burden_sacks"
                    rules={{
                      required:
                        currentOrder.business_code === "palletizing" &&
                        typeReturnBurdenSacks === "partial",
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
                </View>
              )}
              {errorsOrder.return_burden_sacks && (
                <Text style={styles.error}>Este campo es requerido.</Text>
              )}
            </View>
          )}
        </View>
      )}
      {/* Data (Readonly) by business */}
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
          {currentOrder.retreat_yard_name && (
            <RowDetail
              label="Patio de Vacío:"
              value={currentOrder.retreat_yard_name ?? ""}
            />
          )}
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
                Registrar Pesos:
              </Text>
              <ControllerDecimalInput name="burden_kg" label="Origen Bruto" />
              <ControllerDecimalInput name="tara_kg" label="Origen TARA" />
              <View className="mt-1">
                <ImagePickerField
                  control={controlOrder}
                  name="image_scale_ticket"
                  label="Foto de Ticket de Báscula Carga"
                  readonly={currentOrder.trip_status === "finished"}
                />
              </View>
              <ControllerDecimalInput
                name="final_burden_kg"
                label="Destino Bruto"
              />
              <ControllerDecimalInput
                name="final_tara_kg"
                label="Destino TARA"
              />
              <View className="mt-1">
                <ImagePickerField
                  control={controlOrder}
                  name="final_image_scale_ticket"
                  label="Foto de Ticket de Báscula Descarga"
                  readonly={currentOrder.trip_status === "finished"}
                />
              </View>
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
          {currentOrder.trip_status && currentOrder.consolidated_trip && (
            <View className="flex-row items-center">
              <Text className="mr-3 font-semibold">Entrega Consolidada</Text>
              <Controller
                control={controlOrder}
                name="consolidated_delivery"
                render={({ field: { value, onChange } }) => (
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    disabled={currentOrder.trip_status === "finished"}
                    trackColor={{ false: "#9ca3af", true: "#4ade80" }}
                    thumbColor={value ? "#16a34a" : "#f3f4f6"}
                  />
                )}
              />
            </View>
          )}
          {currentOrder.trip_status && (
            <View className="flex-row items-center">
              <Text className="mr-3 font-semibold">
                Ajuste Toneladas Origin
              </Text>
              <Controller
                control={controlOrder}
                name="has_adjustment_tm"
                rules={{ required: hasAdjustmentTm }}
                render={({ field: { value, onChange } }) => (
                  <Switch
                    value={value}
                    disabled={currentOrder.trip_status === "finished"}
                    onValueChange={onChange}
                    trackColor={{ false: "#9ca3af", true: "#4ade80" }}
                    thumbColor={value ? "#16a34a" : "#f3f4f6"}
                  />
                )}
              />
              {hasAdjustmentTm && (
                <View className="flex-1">
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
                        readOnly={currentOrder.trip_status === "finished"}
                        onChangeText={(val) => onChange(val)}
                        className="mx-2 color-secondary bg-gray-50 border rounded-xl outline-none text-sm md:text-base px-2"
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
          )}
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
              {!currentOrder.trip_status && (
                <View className="flex-row items-center">
                  <Text className="mr-3 font-semibold">Bombona Entregada</Text>
                  <Controller
                    control={controlOrder}
                    name="cylinder_delivered"
                    render={({ field: { value, onChange } }) => (
                      <Switch
                        value={value}
                        onValueChange={onChange}
                        disabled={currentOrder.trip_status === "finished"}
                        trackColor={{ false: "#9ca3af", true: "#4ade80" }}
                        thumbColor={value ? "#16a34a" : "#f3f4f6"}
                      />
                    )}
                  />
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Data by business (Hours) */}
      {(currentOrder.trip_status as string) === "initiated" && (
        <View className="flex">
          {/* Buttons Hours */}
          {currentOrder.business_code !== "containers" && (
            <View>
              <Separator />
              <Text className="font-extrabold text-lg color-primary underline mb-2">
                Registrar Fechas/Horas:
              </Text>
              {/* The dot marking button depends on the property type */}
              {currentOrder.type_property === "own" && (
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
              )}
              {currentOrder.type_property === "third" && (
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
              )}
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
          {/* Buttons Hours - Containers - Import (immediate loading) */}
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
                <View className="my-1">
                  <Text className="font-semibold">Contenedor</Text>
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
        </View>
      )}
      {(currentOrder.trip_status as string) === "initiated" && <Separator />}

      {/* Moves - Only in export */}
      {(currentOrder.trip_status as string) === "initiated" &&
        currentOrder.business_code === "containers" &&
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
      {(currentOrder.trip_status as string) === "initiated" &&
        currentOrder.business_code !== "containers" && (
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
      {(currentOrder.trip_status as string) === "initiated" &&
        currentOrder.business_code === "containers" &&
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
      {(currentOrder.trip_status as string) === "initiated" && (
        <ListObservations
          observations={currentOrder.observations}
          order={currentOrder}
          onUpdate={(newObservations) =>
            updateOrderField("observations", newObservations)
          }
          orderFinished={currentOrder.trip_status === "finished"}
        />
      )}

      {/* Button Save trip */}
      {["initiated", null].includes(currentOrder.trip_status) && (
        <View className="mx-2 mb-3">
          <TouchableOpacity
            className="w-full flex-row px-5 py-4 items-center justify-center bg-emerald-50 border border-emerald-100 rounded-2xl active:bg-emerald-100"
            onPress={handleSubmitOrder(handleSaveOrder)}
          >
            {loadingSave ? (
              <ActivityIndicator color="#10b981" />
            ) : (
              <View className="items-center flex-row gap-2">
                <FontAwesomeSave color="#10b981" size={18} />
                <Text className="font-extrabold uppercase tracking-widest text-sm color-emerald-600">
                  GUARDAR CAMBIOS
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Button End trip */}
      {["initiated", null].includes(currentOrder.trip_status) && (
        <View className="mx-2 mb-4">
          <TouchableOpacity
            className="w-full flex-row px-5 py-4 items-center justify-center bg-slate-900 border border-slate-800 rounded-2xl shadow-sm active:bg-slate-800"
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
              <View className="items-center flex-row gap-2">
                <FontAwesomeStop color="white" size={18} />
                <Text className="font-extrabold uppercase tracking-widest text-sm color-white">
                  FINALIZAR VIAJE
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Map Modal */}
      <Modal
        visible={isMapModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsMapModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
          <View className="bg-slate-900 pt-12 pb-4 px-5 flex-row sticky top-0 z-50 rounded-b-3xl">
            <TouchableOpacity
              onPress={() => setIsMapModalVisible(false)}
              className="bg-slate-800 px-5 py-2.5 rounded-xl border border-slate-700"
            >
              <Text className="color-white font-bold tracking-wider text-xs uppercase">
                ← Volver
              </Text>
            </TouchableOpacity>
            <View className="flex-1 justify-center items-center pr-10">
              <Text className="color-white font-extrabold text-base">
                Ruta Asignada
              </Text>
            </View>
          </View>

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
