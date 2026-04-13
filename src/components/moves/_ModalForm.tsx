import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Move, Order, Ubication, Geocerca } from "../../shared.types";
import { Dropdown } from "react-native-element-dropdown";
import Toast from "react-native-toast-message";
import { getListUbications, getListGeocercas } from "../../services/odoo/order";
import { createOrUpdateMove } from "../../services/odoo/move";
import { cssInterop } from "nativewind";
import { InputDatetimePicker } from "../InputDatetimePicker";
import { parse } from "date-fns";

const StyledDropdown = cssInterop(Dropdown, { className: "style" });

type Props = {
  visible: boolean;
  move: Move | null;
  onClose: () => void;
  order: Order;
  onSave: (move: Move) => void;
};

type FormData = {
  id: number | null;
  origin_id: number | null;
  destination_id: number | null;
  geocerca_id: number | null;
  geocerca_destination_id: number | null;
  date_in: Date;
  date_out: Date;
};

export function MoveModalForm({
  visible,
  move,
  order,
  onClose,
  onSave,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [ubications, setUbications] = useState<Ubication[]>([]);
  const [geocercas, setGeocercas] = useState<Geocerca[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      id: null,
      origin_id: null,
      destination_id: null,
      geocerca_id: null,
      geocerca_destination_id: null,
      date_in: new Date(),
      date_out: new Date(),
    },
  });

  useEffect(() => {
    getListUbications().then((data) => setUbications(data.results ?? []));
    getListGeocercas().then((data) => setGeocercas(data.results ?? []));
  }, []);

  useEffect(() => {
    if (move) {
      reset({
        id: move.id,
        origin_id: move.origin.id,
        destination_id: move.destination.id,
        geocerca_id: move.geocerca.id,
        geocerca_destination_id: move.geocerca_destination.id,
        date_in: parse(move.date_in, "dd/MM/yyyy HH:mm:ss", new Date()),
        date_out: parse(move.date_out, "dd/MM/yyyy HH:mm:ss", new Date()),
      });
    }
  }, [move, reset]);

  useEffect(() => {
    return () => {
      // Cleanup logic on unmount (when modal is destroyed)
    };
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const savedMove = await createOrUpdateMove(data, order.id);
      onSave(savedMove);
    } catch (error: any) {
      Toast.show({ type: "error", text1: error });
    } finally {
      Toast.show({
        type: "success",
        text1:
          (data.id && "Movimiento editado correctamente.") ||
          "Movimiento creado correctamente.",
      });
      setLoading(false);
      reset();
      onClose();
    }
  };

  const renderDropdown = (
    name: keyof FormData,
    label: string,
    items: { id: number; name: string }[],
    placeholder: string,
  ) => (
    <Controller
      control={control}
      name={name}
      rules={{ required: true }}
      render={({ field: { value, onChange } }) => (
        <View className="mb-2">
          <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mb-2 ml-1">
            {label}
          </Text>
          <View className="bg-white border border-slate-100 shadow-sm rounded-[24px] overflow-hidden h-14 justify-center">
            <StyledDropdown
              data={items}
              labelField="name"
              valueField="id"
              value={value}
              placeholder={placeholder}
              search
              onChange={(item) => onChange(item.id)}
              className="w-full text-slate-900 font-bold px-4"
              placeholderStyle={{ color: "#9ca3af" }}
              inputSearchStyle={{ height: 40, fontSize: 16 }}
            />
          </View>
          {errors[name] && (
            <Text className="font-bold text-red-500 uppercase tracking-widest text-[10px] ml-1 mt-1">
              ESTE CAMPO ES REQUERIDO.
            </Text>
          )}
        </View>
      )}
    />
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-slate-50 pt-10 px-5">
        <Text className="text-2xl font-extrabold color-slate-900 mb-6 text-center tracking-tight">
          {(move && "Editar Movimiento") || "Nuevo Movimiento"}
        </Text>

        {renderDropdown("origin_id", "Ruta Origen", ubications, "Ej: DURÁN")}
        {renderDropdown(
          "destination_id",
          "Ruta Destino",
          ubications,
          "Ej: DURÁN",
        )}
        {renderDropdown("geocerca_id", "Origen", geocercas, "Ej: AYALAN")}
        {renderDropdown(
          "geocerca_destination_id",
          "Destino",
          geocercas,
          "Ej: AYALAN",
        )}

        <View className="mb-2 w-full">
          <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mb-2 ml-1">
            Ingreso
          </Text>
          <View className="bg-white border border-slate-100 shadow-sm rounded-[24px] overflow-hidden py-1 h-14 justify-center">
            <InputDatetimePicker
              control={control}
              name="date_in"
              label="Ingreso"
            />
          </View>
          {errors.date_in && (
            <Text className="font-bold text-red-500 uppercase tracking-widest text-[10px] ml-1 mt-1">
              ESTE CAMPO ES REQUERIDO.
            </Text>
          )}
        </View>

        <View className="mb-4 w-full">
          <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mb-2 ml-1">
            Salida
          </Text>
          <View className="bg-white border border-slate-100 shadow-sm rounded-[24px] overflow-hidden py-1 h-14 justify-center">
            <InputDatetimePicker
              control={control}
              name="date_out"
              label="Salida"
            />
          </View>
          {errors.date_out && (
            <Text className="font-bold text-red-500 uppercase tracking-widest text-[10px] ml-1 mt-1">
              ESTE CAMPO ES REQUERIDO.
            </Text>
          )}
        </View>

        <View className="gap-y-3 mt-4">
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            className="bg-primary rounded-[24px] py-4 items-center justify-center shadow-sm active:bg-red-800"
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="color-white font-extrabold tracking-widest text-sm uppercase">
                Guardar Movimiento
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            className="bg-white border border-gray-200 rounded-[24px] py-4 items-center justify-center active:bg-gray-50 mb-10"
          >
            <Text className="color-gray-600 font-extrabold tracking-widest text-sm uppercase">
              Descartar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  error: { color: "#e10718" },
});
