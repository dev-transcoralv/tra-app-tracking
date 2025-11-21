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
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex p-4">
        <Text className="font-extrabold text-lg color-blue-900 text-center mb-4">
          {(observation && "*** EDITAR OBSERVACIÓN ***") ||
            "*** CREAR OBSERVACIÓN ***"}
        </Text>
        <View className="w-full flex flex-col gap-4">
          <View className="w-full flex">
            <Controller
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Text className="font-semibold mb-1">Descripción</Text>
                  <TextInput
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholderTextColor="#211915"
                    className="color-secondary p-2 rounded-lg bg-secondary-complementary border-0 w-full outline-none text-sm md:text-base"
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
            <Text className="font-bold text-primary">
              Este campo es requerido.
            </Text>
          )}

          <View className="flex-row gap-x-2">
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              className="flex-1 bg-primary px-5 py-3 items-center"
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="color-white font-semibold">GUARDAR</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-secondary px-5 py-3 items-center"
            >
              <Text className="color-white font-semibold">DESCARTAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
