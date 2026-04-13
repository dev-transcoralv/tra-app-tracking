import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Observation, Order } from "../../shared.types";
import Toast from "react-native-toast-message";
import { createOrUpdateObservation } from "../../services/odoo/observation";

type Props = {
  visible: boolean;
  observation: Observation | null;
  onClose: () => void;
  order: Order;
  onSave: (observation: Observation) => void;
};

type FormData = {
  id: number | null;
  name: string;
};

export function ObservationModalForm({
  visible,
  observation,
  order,
  onClose,
  onSave,
}: Props) {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      id: null,
      name: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const observation = await createOrUpdateObservation(
        data?.id,
        data.name,
        order.id,
      );
      onSave(observation);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error,
      });
      throw error;
    } finally {
      Toast.show({
        type: "success",
        text1:
          (data.id && "Observación editada correctamente.") ||
          "Observación creada correctamente.",
      });
      setLoading(false);
      reset();
      onClose();
    }
  };

  useEffect(() => {
    if (observation) {
      reset({
        id: observation.id,
        name: observation.name,
      });
    }
  }, [observation, reset]);

  useEffect(() => {
    return () => {
      // Cleanup logic on unmount (when modal is destroyed)
    };
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-slate-50 pt-10 px-5">
        <Text className="text-2xl font-extrabold color-slate-900 mb-6 text-center tracking-tight">
          {(observation && "Editar Observación") || "Nueva Observación"}
        </Text>
        <View className="w-full flex flex-col gap-4">
          <View className="w-full flex">
            <Controller
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mb-2 ml-1">
                    Descripción
                  </Text>
                  <TextInput
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholderTextColor="#9ca3af"
                    className="color-slate-900 p-4 rounded-[24px] bg-white border border-slate-100 shadow-sm w-full outline-none text-base font-medium h-32"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              )}
              name="name"
            />
          </View>
          {errors.name && (
            <Text className="font-bold text-red-500 uppercase tracking-widest text-[10px] ml-1 mt-1">
              ESTE CAMPO ES REQUERIDO.
            </Text>
          )}

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
                  Guardar Observación
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
      </View>
    </Modal>
  );
}
