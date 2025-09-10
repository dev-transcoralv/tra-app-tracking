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
  const [selectedItem, setSelectedItem] = useState<GrainOperation | null>(null);

  const renderDropdownItem = (item: GrainOperation, selected?: boolean) => {
    const index = grainOperations.findIndex((i) => i.id === item.id);

    return (
      <View>
        <View className="mx-2 my-2 px-1 py-1 bg-blue-200">
          <View className="flex-row">
            <Text className="font-bold">Cliente:</Text>
            <Text className="ml-2">{item.partner_name}</Text>
          </View>
          <View className="flex-row">
            <Text className="font-bold">Buque:</Text>
            <Text className="ml-2">{item.ship_name}</Text>
          </View>
          <View className="flex-row">
            <Text className="font-bold">Destino:</Text>
            <Text className="ml-2">{item.recipient_name}</Text>
          </View>
        </View>

        {index < grainOperations.length - 1 && (
          <View
            style={{
              height: 2,
              backgroundColor: "black",
              marginHorizontal: 8,
            }}
          />
        )}
      </View>
    );
  };

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

  const handleClose = () => {
    reset(); // clears react-hook-form values
    setSelectedItem(null); // clears selected dropdown item
    onClose(); // closes modal
  };

  const onSubmit = async (data: FormData) => {
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
      handleClose();
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
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
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
                  value={selectedItem ? selectedItem.id : null}
                  search
                  selectedTextStyle={{ color: "black" }}
                  inputSearchStyle={{ height: 40, fontSize: 16 }}
                  onChange={(item) => {
                    setSelectedItem(item); // whole object
                    onChange(item.id);
                  }}
                  className="w-full h-12 bg-secondary-complementary border border-gray-300 rounded-lg px-3"
                  placeholderStyle={{ color: "#999" }}
                  renderItem={renderDropdownItem}
                />
              )}
            />
          </View>
          {errors.grain_operation_id && (
            <Text className="font-bold" style={styles.error}>
              Este campo es requerido.
            </Text>
          )}

          {selectedItem && (
            <View>
              <View className="flex-row">
                <Text className="font-bold">Cliente:</Text>
                <Text className="ml-2">{selectedItem.partner_name}</Text>
              </View>
              <View className="flex-row">
                <Text className="font-bold">Buque:</Text>
                <Text className="ml-2">{selectedItem.ship_name}</Text>
              </View>
              <View className="flex-row">
                <Text className="font-bold">Destino:</Text>
                <Text className="ml-2">{selectedItem.recipient_name}</Text>
              </View>
              <View className="flex-row">
                <Text className="font-bold">Placa:</Text>
                <Text className="ml-2">{selectedItem.vehicle_name}</Text>
              </View>
              {selectedItem.type_property === "third" && (
                <View className="flex-row">
                  <Text className="font-bold">Proveedor:</Text>
                  <Text className="ml-2">{selectedItem.supplier_name}</Text>
                </View>
              )}
              <View className="flex-row">
                <Text className="font-bold">Operación:</Text>
                <Text className="ml-2">{selectedItem.operation_name}</Text>
              </View>
              <View className="flex-row">
                <Text className="font-bold">Material:</Text>
                <Text className="ml-2">{selectedItem.material_name}</Text>
              </View>
            </View>
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
            onPress={handleClose}
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
