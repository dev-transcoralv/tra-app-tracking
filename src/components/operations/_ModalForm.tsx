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
        <View className="mx-2 my-2.5 px-3 py-3 bg-blue-50 border border-blue-100 rounded-xl">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="font-bold text-blue-600 uppercase text-[10px] tracking-widest">
              Cliente
            </Text>
            <Text className="ml-2 color-gray-800 font-bold text-xs">
              {item.partner_name}
            </Text>
          </View>
          <View className="flex-row justify-between items-center mb-1">
            <Text className="font-bold text-blue-600 uppercase text-[10px] tracking-widest">
              Buque
            </Text>
            <Text className="ml-2 color-gray-800 font-bold text-xs">
              {item.ship_name}
            </Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="font-bold text-blue-600 uppercase text-[10px] tracking-widest">
              Destino
            </Text>
            <Text className="ml-2 color-gray-800 font-bold text-xs">
              {item.recipient_name}
            </Text>
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
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-slate-50 pt-12 px-5">
        <Text className="text-2xl font-extrabold color-slate-900 mb-6 text-center tracking-tight">
          Nuevo Operativo
        </Text>
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
                  placeholder="Seleccione una operación"
                  valueField="id"
                  value={selectedItem ? selectedItem.id : null}
                  search
                  selectedTextStyle={{ color: "black" }}
                  inputSearchStyle={{ height: 40, fontSize: 16 }}
                  onChange={(item) => {
                    setSelectedItem(item); // whole object
                    onChange(item.id);
                  }}
                  className="w-full h-14 bg-white border border-gray-200 shadow-sm rounded-2xl px-4"
                  placeholderStyle={{ color: "#9ca3af", fontWeight: "bold" }}
                  renderItem={renderDropdownItem}
                />
              )}
            />
          </View>
          {errors.grain_operation_id && (
            <Text className="font-bold" style={styles.error}>
              ESTE CAMPO ES REQUERIDO.
            </Text>
          )}

          {selectedItem && (
            <View className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 mb-2">
              <View className="flex-row justify-between items-center py-2.5 border-b border-gray-50">
                <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">
                  Cliente
                </Text>
                <Text className="ml-2 text-gray-900 font-semibold text-sm">
                  {selectedItem.partner_name}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-2.5 border-b border-gray-50">
                <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">
                  Buque
                </Text>
                <Text className="ml-2 text-gray-900 font-semibold text-sm">
                  {selectedItem.ship_name}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-2.5 border-b border-gray-50">
                <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">
                  Destino
                </Text>
                <Text className="ml-2 text-gray-900 font-semibold text-sm">
                  {selectedItem.recipient_name}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-2.5 border-b border-gray-50">
                <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">
                  Placa
                </Text>
                <Text className="ml-2 text-gray-900 font-semibold text-sm">
                  {selectedItem.vehicle_name}
                </Text>
              </View>
              {selectedItem.type_property === "third" && (
                <View className="flex-row justify-between items-center py-2.5 border-b border-gray-50">
                  <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">
                    Proveedor
                  </Text>
                  <Text className="ml-2 text-gray-900 font-semibold text-sm">
                    {selectedItem.supplier_name}
                  </Text>
                </View>
              )}
              <View className="flex-row justify-between items-center py-2.5 border-b border-gray-50">
                <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">
                  Operación
                </Text>
                <Text className="ml-2 text-gray-900 font-semibold text-sm">
                  {selectedItem.operation_name}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-2.5">
                <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">
                  Material
                </Text>
                <Text className="ml-2 text-gray-900 font-semibold text-sm">
                  {selectedItem.material_name}
                </Text>
              </View>
            </View>
          )}

          <View className="gap-y-3 mt-4">
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              className="bg-primary rounded-2xl py-4 items-center justify-center shadow-sm active:bg-red-800"
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="color-white font-extrabold tracking-widest text-sm uppercase">
                  Seleccionar Operación
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClose}
              className="bg-white border border-gray-200 rounded-2xl py-4 items-center justify-center active:bg-gray-50 mb-10"
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
const styles = StyleSheet.create({
  error: {
    color: "#e10718",
  },
});
