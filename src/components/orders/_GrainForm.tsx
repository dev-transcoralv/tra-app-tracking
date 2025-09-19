import { useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Order } from "../../shared.types";
import Toast from "react-native-toast-message";
import { useForm, Controller } from "react-hook-form";
import { updateBusinessGrain } from "../../services/odoo/order";
import { ImagePickerField } from "../ImagePickerField";

type FormData = {
  burden_kg: number;
  tara_kg: number;
  final_burden_kg: number;
  final_tara_kg: number;
  image_scale_ticket: string | null;
  final_image_scale_ticket: string | null;
};

export function GrainForm({
  order,
  onSave,
}: {
  order: Order;
  onSave: (data: FormData) => void;
}) {
  const [loadingGrainForm, setLoadingGrainForm] = useState(false);

  // ✅ react-hook-form con valores por defecto
  const {
    control,
    handleSubmit,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      burden_kg: order.burden_kg || 0,
      tara_kg: order.tara_kg || 0,
      final_burden_kg: order.final_burden_kg || 0,
      final_tara_kg: order.final_tara_kg || 0,
      image_scale_ticket: order.image_scale_ticket,
      final_image_scale_ticket: order.final_image_scale_ticket,
    },
  });

  const ControlledDecimalInput = ({
    name,
    label,
  }: {
    name: keyof FormData;
    label: string;
  }) => (
    <View className="flex-row mt-2">
      <Text className="w-1/4 font-bold align-middle">{label}:</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            inputMode="numeric"
            keyboardType="decimal-pad"
            onBlur={onBlur}
            readOnly={order.trip_status === "finished"}
            onChangeText={(val) => onChange(Number(val))}
            className="mx-2 w-7/12 color-secondary bg-gray-50 border rounded-xl outline-none text-sm md:text-base px-2"
            value={value?.toString() ?? ""}
          />
        )}
      />
      <Text className="w-1/6 font-bold align-middle">/Kg</Text>
    </View>
  );

  const onSubmit = async (data: FormData) => {
    try {
      setLoadingGrainForm(true);
      await updateBusinessGrain(order.id, data);
      onSave(data);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error,
      });
      throw error;
    } finally {
      setLoadingGrainForm(false);
    }
  };

  return (
    <View>
      <ControlledDecimalInput name="burden_kg" label="Origen Bruto" />
      <ControlledDecimalInput name="tara_kg" label="Origen TARA" />
      <View className="mt-1">
        <ImagePickerField
          control={control}
          name="image_scale_ticket"
          label="Foto de Ticket de Báscula Carga"
        />
      </View>
      <ControlledDecimalInput name="final_burden_kg" label="Destino Bruto" />
      <ControlledDecimalInput name="final_tara_kg" label="Destino TARA" />
      <View className="mt-1">
        <ImagePickerField
          control={control}
          name="final_image_scale_ticket"
          label="Foto de Ticket de Báscula Descarga"
        />
      </View>
      {order.trip_status !== "finished" && (
        <TouchableOpacity
          className="flex-1 my-2 px-5 py-2 items-center bg-blue-900"
          onPress={handleSubmit(onSubmit)}
        >
          {loadingGrainForm ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View className="items-center">
              <Text className="items-center font-extrabold color-white">
                Actualizar Pesos
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
