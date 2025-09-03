import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Button,
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { control, handleSubmit, setValue, reset } = useForm<FormData>({
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
      <View style={{ padding: 20, flex: 1 }}>
        <View className="w-full flex flex-col gap-4">
          <View className="w-full flex items-center gap-2 bg-secondary-complementary p-2 rounded-xl">
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="p.e. Todo correcto"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholderTextColor="#211915"
                  className="color-secondary bg-transparent border-0 w-full outline-none text-sm md:text-base"
                  multiline
                />
              )}
              name="name"
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            className="bg-primary px-5 py-3 items-center"
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold">Enviar</Text>
            )}
          </TouchableOpacity>

          <Button title="Descartar" color="gray" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
