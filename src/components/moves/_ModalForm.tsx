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
          <Text className="font-semibold mb-1">{label}</Text>
          <StyledDropdown
            data={items}
            labelField="name"
            valueField="id"
            value={value}
            placeholder={placeholder}
            search
            onChange={(item) => onChange(item.id)}
            className="w-full h-12 bg-secondary-complementary border border-gray-300 rounded-lg px-3"
            placeholderStyle={{ color: "#999" }}
            inputSearchStyle={{ height: 40, fontSize: 16 }}
          />
          {errors[name] && (
            <Text style={styles.error}>Este campo es requerido.</Text>
          )}
        </View>
      )}
    />
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex p-4">
        <Text className="font-extrabold text-lg color-blue-900 text-center mb-4">
          {(move && "*** EDITAR MOVIMIENTO ***") || "*** CREAR MOVIMIENTO ***"}
        </Text>

        {renderDropdown("origin_id", "* Ruta Origen:", ubications, "p.e DURÁN")}
        {renderDropdown(
          "destination_id",
          "* Ruta Destino:",
          ubications,
          "p.e DURÁN",
        )}
        {renderDropdown("geocerca_id", "* Origen:", geocercas, "p.e AYALAN")}
        {renderDropdown(
          "geocerca_destination_id",
          "* Destino:",
          geocercas,
          "p.e AYALAN",
        )}

        <View className="mb-2">
          <Text className="font-semibold mb-1">* Ingreso:</Text>
          <InputDatetimePicker
            control={control}
            name="date_in"
            label="Ingreso"
          />
          {errors.date_in && (
            <Text style={styles.error}>Este campo es requerido.</Text>
          )}
        </View>

        <View className="mb-4">
          <Text className="font-semibold mb-1">* Salida:</Text>
          <InputDatetimePicker
            control={control}
            name="date_out"
            label="Salida"
          />
          {errors.date_out && (
            <Text style={styles.error}>Este campo es requerido.</Text>
          )}
        </View>

        <View className="flex-row gap-x-2">
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            className="flex-1 bg-primary px-5 py-3 items-center"
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold">GUARDAR</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            className="flex-1 bg-secondary px-5 py-3 items-center"
          >
            <Text className="text-white font-semibold">DESCARTAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  error: { color: "#e10718" },
});
