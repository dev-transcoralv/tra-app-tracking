/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { InputDatePicker } from "../../components/InputDatePicker";
import { Dropdown } from "react-native-element-dropdown";
import { useForm, Controller } from "react-hook-form";
import { Leave, LeaveType } from "../../shared.types";
import Toast from "react-native-toast-message";
import {
  createOrUpdateLeave,
  getListLeaveTypes,
} from "../../services/odoo/leave";
import { parse, format } from "date-fns";
import { cssInterop } from "nativewind";
import { AuthContext } from "../../utils/authContext";
import { useRouter } from "expo-router";

const StyledDropdown = cssInterop(Dropdown, {
  className: "style",
});

type Props = {
  leave: Leave | null | undefined;
  visible: boolean;
  onClose: () => void;
};

type FormData = {
  id: number | null;
  name: string;
  holiday_status_id: number | null;
  request_date_from: Date;
  request_date_to: Date;
};

export function LeaveModalForm({ leave, visible, onClose }: Props) {
  const { driver } = useContext(AuthContext);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      id: null,
      name: "",
      holiday_status_id: null,
      request_date_from: new Date(),
      request_date_to: new Date(),
    },
  });
  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await createOrUpdateLeave(
        driver?.id,
        leave?.id,
        data?.holiday_status_id,
        format(data.request_date_from, "yyyy-MM-dd"),
        format(data.request_date_to, "yyyy-MM-dd"),
        data.name,
      );
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
      setTimeout(() => {
        router.replace({
          pathname: "/leaves/index",
          params: { refresh: Date.now() },
        });
      }, 300);
    }
  };

  useEffect(() => {
    const getLeaveTypes = async () => {
      try {
        const data = await getListLeaveTypes();
        const fetchLeaveTypes = data.results ?? [];
        setLeaveTypes(fetchLeaveTypes);
      } catch (err) {
        console.error(err);
      } finally {
      }
    };

    getLeaveTypes();
  }, []);

  useEffect(() => {
    if (leave) {
      reset({
        id: leave.id,
        name: leave.name,
        holiday_status_id: leave.holiday_status.id,
        request_date_from: parse(
          leave.request_date_from,
          "dd/MM/yyyy",
          new Date(),
        ),
        request_date_to: parse(leave.request_date_to, "dd/MM/yyyy", new Date()),
      });
    }
  }, [leave, reset]);

  useEffect(() => {
    return () => {
      // Cleanup logic on unmount (when modal is destroyed)
    };
  }, []);

  const canEdit = Boolean(
    leave && ["validate", "validate1", "refuse"].includes(leave.state),
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ padding: 20, flex: 1 }}>
        <View className="w-full flex flex-col gap-4">
          <View className="w-full flex items-center gap-2">
            <Controller
              control={control}
              name="holiday_status_id"
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <StyledDropdown
                  data={leaveTypes}
                  labelField="name"
                  valueField="id"
                  placeholder="p.e Tipo"
                  disable={canEdit}
                  value={value}
                  onChange={(item) => onChange(item.id)}
                  className="w-full h-12 bg-secondary-complementary border border-gray-300 rounded-lg px-3"
                  placeholderStyle={{ color: "#999" }}
                />
              )}
            />
          </View>
          {errors.holiday_status_id && (
            <Text className="font-bold" style={styles.error}>
              Este campo es requerido.
            </Text>
          )}

          <View className="w-full flex items-center gap-2">
            <InputDatePicker
              control={control}
              name="request_date_from"
              label="Fecha inicio"
              disabled={canEdit}
            />
          </View>
          {errors.request_date_from && (
            <Text className="font-bold" style={styles.error}>
              Este campo es requerido.
            </Text>
          )}

          <View className="w-full flex items-center gap-2">
            <InputDatePicker
              control={control}
              name="request_date_to"
              label="Fecha fin"
              disabled={canEdit}
            />
          </View>
          {errors.request_date_to && (
            <Text className="font-bold" style={styles.error}>
              Este campo es requerido.
            </Text>
          )}

          <View className="w-full flex items-center gap-2 bg-secondary-complementary p-2 rounded-xl">
            <Controller
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="p.e. Descripción de la ausencia"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  readOnly={canEdit}
                  placeholderTextColor="#211915"
                  className="color-secondary bg-transparent border-0 w-full outline-none text-sm md:text-base"
                  multiline
                />
              )}
              name="name"
            />
          </View>
          {errors.name && (
            <Text className="font-bold" style={styles.error}>
              Este campo es requerido.
            </Text>
          )}
          {!canEdit && (
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
          )}
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
