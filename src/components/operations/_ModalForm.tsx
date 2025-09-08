import { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Dropdown } from "react-native-element-dropdown";
import { GrainOperation, Order } from "../../shared.types";
import Toast from "react-native-toast-message";
import {
  getListGrainOperations,
  processGrainOperation,
} from "../../services/odoo/operation";
import { cssInterop } from "nativewind";
import { AuthContext } from "../../utils/authContext";
import { useRouter } from "expo-router";

const StyledDropdown = cssInterop(Dropdown, {
  className: "style",
});

type Props = {
  visible: boolean;
  onClose: () => void;
};

type FormData = {
  grain_operation_id: number | null;
};

export function GrainOperationModalForm({ visible, onClose }: Props) {
  const router = useRouter();
  const { driver } = useContext(AuthContext);
  const [grainOperations, setGrainOperations] = useState<GrainOperation[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      grain_operation_id: null,
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log(data?.grain_operation_id);
    try {
      setLoading(true);
      const order: Order = await processGrainOperation(
        data?.grain_operation_id,
      );
      router.push({
        pathname: `orders/${order.id}`,
        params: { reference: order.name },
      } as any);
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
    const getGrainOperations = async () => {
      try {
        const data = await getListGrainOperations({
          page: 1,
          driverId: driver?.id,
          state: "enabled",
        });
        const fetchgrainOperations = data.results ?? [];
        setGrainOperations(fetchgrainOperations);
      } catch (err) {
        console.error(err);
      } finally {
      }
    };

    getGrainOperations();
  }, [driver?.id]);

  useEffect(() => {
    return () => {
      // Cleanup logic on unmount (when modal is destroyed)
    };
  }, []);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ padding: 20, flex: 1 }}>
        <View className="w-full flex flex-col gap-4">
          <View className="w-full flex items-center gap-2">
            <Controller
              control={control}
              name="grain_operation_id"
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <StyledDropdown
                  data={grainOperations}
                  labelField="name"
                  valueField="id"
                  value={value}
                  onChange={(item) => onChange(item.id)}
                  className="w-full h-12 bg-secondary-complementary border border-gray-300 rounded-lg px-3"
                  placeholderStyle={{ color: "#999" }}
                />
              )}
            />
          </View>
          {errors.grain_operation_id && (
            <Text className="font-bold" style={styles.error}>
              Este campo es requerido.
            </Text>
          )}

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

          <TouchableOpacity
            onPress={onClose}
            className="bg-secondary px-5 py-3 items-center"
          >
            <Text className="text-white font-semibold">Descartar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  error: {
    color: "#e10718",
  },
});
