/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Image,
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
import { ImagePickerField } from "../ImagePickerField";

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
  image: string | null;
};

export function LeaveModalForm({ leave, visible, onClose }: Props) {
  const { driver } = useContext(AuthContext);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);

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
      image: "",
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
        data.image,
      );
      setImageUri(null);
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
          pathname: "leaves",
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
        image:
          (leave.image &&
            setImageUri(`data:image/png;base64,${leave.image}`)) ||
          null,
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
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-slate-50 pt-10 px-5">
        <Text className="text-2xl font-extrabold color-slate-900 mb-6 text-center tracking-tight">
          {(leave && "Editar Ausencia") || "Nueva Ausencia"}
        </Text>
        <View className="w-full flex flex-col gap-4">
          {/* Image */}
          {!canEdit && (
            <ImagePickerField
              control={control}
              name="image"
              label="Foto de Ausencia"
            />
          )}
          {imageUri && (
            <Image
              style={{
                width: "100%",
                height: 200,
                marginBottom: 10,
                borderRadius: 24,
              }}
              source={{ uri: imageUri }}
            />
          )}
          <View className="w-full flex">
            <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mb-2 ml-1">
              Tipo de Ausencia
            </Text>
            <View className="bg-white border border-slate-100 shadow-sm rounded-[24px] overflow-hidden h-14 justify-center">
              <Controller
                control={control}
                name="holiday_status_id"
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <StyledDropdown
                    data={leaveTypes}
                    labelField="name"
                    valueField="id"
                    placeholder="Seleccionar..."
                    disable={canEdit}
                    value={value}
                    search
                    inputSearchStyle={{ height: 40, fontSize: 16 }}
                    onChange={(item) => onChange(item.id)}
                    className="w-full text-slate-900 font-bold px-4"
                    placeholderStyle={{ color: "#9ca3af" }}
                  />
                )}
              />
            </View>
            {errors.holiday_status_id && (
              <Text className="font-bold text-red-500 uppercase tracking-widest text-[10px] ml-1 mt-1">
                ESTE CAMPO ES REQUERIDO.
              </Text>
            )}
          </View>

          <View className="w-full flex">
            <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mb-1 ml-1">
              Fecha de Inicio
            </Text>
            <InputDatePicker
              control={control}
              name="request_date_from"
              label="Fecha inicio"
              disabled={canEdit}
            />
            {errors.request_date_from && (
              <Text className="font-bold text-red-500 uppercase tracking-widest text-[10px] ml-1 mt-1">
                ESTE CAMPO ES REQUERIDO.
              </Text>
            )}
          </View>

          <View className="w-full flex">
            <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mb-1 ml-1">
              Fecha de Fin
            </Text>
            <InputDatePicker
              control={control}
              name="request_date_to"
              label="Fecha fin"
              disabled={canEdit}
            />
            {errors.request_date_to && (
              <Text className="font-bold text-red-500 uppercase tracking-widest text-[10px] ml-1 mt-1">
                ESTE CAMPO ES REQUERIDO.
              </Text>
            )}
          </View>

          <View className="w-full flex">
            <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mb-2 ml-1">
              Descripción de la ausencia
            </Text>
            <Controller
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Ej: Trámite personal"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  readOnly={canEdit}
                  placeholderTextColor="#9ca3af"
                  className="color-slate-900 p-4 rounded-[24px] bg-white border border-slate-100 shadow-sm w-full outline-none text-base font-medium h-24"
                  multiline
                  textAlignVertical="top"
                />
              )}
              name="name"
            />
            {errors.name && (
              <Text className="font-bold text-red-500 uppercase tracking-widest text-[10px] ml-1 mt-1">
                ESTE CAMPO ES REQUERIDO.
              </Text>
            )}
          </View>

          <View className="gap-y-3 mt-4">
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              className="bg-primary rounded-[24px] py-4 items-center justify-center shadow-sm active:bg-red-800"
              disabled={loading || canEdit}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="color-white font-extrabold tracking-widest text-sm uppercase">
                  Guardar Ausencia
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
