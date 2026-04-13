import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Guide, Order } from "../../shared.types";
import Toast from "react-native-toast-message";
import { createOrUpdateGuide } from "../../services/odoo/guide";
import { ImagePickerField } from "../ImagePickerField";
import { Picker } from "@react-native-picker/picker";
import { cssInterop } from "nativewind";

const StyledPicker = cssInterop(Picker, {
  className: "style",
});

type Props = {
  visible: boolean;
  guide: Guide | null;
  onClose: () => void;
  order: Order;
  onSave: (guide: Guide) => void;
};

type FormData = {
  id: number | null;
  type: "own" | "third";
  name: string;
  comment: string;
  image: string;
};

export function GuideModalForm({
  visible,
  guide,
  order,
  onClose,
  onSave,
}: Props) {
  const [loading, setLoading] = useState(false);

  // 1. Define default values for a "Clean" form
  const defaultValues: FormData = useMemo(
    () => ({
      id: null,
      type: "third",
      name: "",
      comment: "",
      image: "",
    }),
    [],
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    criteriaMode: "all",
    defaultValues: defaultValues,
  });

  // 2. Handle Reset Logic (Open/Edit/Create)
  useEffect(() => {
    if (visible) {
      if (guide) {
        // EDIT MODE: Populate form with guide data
        reset({
          id: guide.id,
          type: guide.type,
          name: guide.name,
          comment: guide.comment || "",
          image: guide.image || "",
        });
      } else {
        // CREATE MODE: Reset to default empty values
        reset(defaultValues);
      }
    }
  }, [visible, guide, reset, defaultValues]);

  // 3. Manual Close Handler
  const handleClose = () => {
    reset(defaultValues); // Optional: Clear form on close to prevent flash on next open
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const savedGuide = await createOrUpdateGuide(order.id, data);
      onSave(savedGuide);

      Toast.show({
        type: "success",
        text1: data.id
          ? "Guía editada correctamente."
          : "Guía creada correctamente.",
      });

      reset(defaultValues);
      onClose(); // Use prop onClose here as reset is done
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error.message || "Error al guardar",
      });
      // Do not throw error here unless you want to crash the app or catch it higher up
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-slate-50 pt-10 px-5">
        <Text className="text-2xl font-extrabold color-slate-900 mb-6 text-center tracking-tight">
          {guide ? "Editar Guía" : "Nueva Guía"}
        </Text>
        <View className="w-full flex flex-col gap-4">
          {/* Image */}
          <ImagePickerField
            control={control}
            name="image"
            label="Foto de Guía"
            defaultValue={guide?.image || ""}
            required={true}
          />

          <View>
            <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mb-2 ml-1">
              Tipo de Guía
            </Text>
            <View className="bg-white border border-slate-100 shadow-sm rounded-[24px] overflow-hidden h-14 justify-center">
              <Controller
                control={control}
                rules={{
                  required: "ESTE CAMPO ES REQUERIDO.",
                }}
                name="type"
                render={({ field: { onChange, value } }) => (
                  <StyledPicker
                    selectedValue={value}
                    onValueChange={(itemValue) => onChange(itemValue)}
                    className="w-full text-slate-900 font-bold"
                  >
                    <Picker.Item label="Guía de Cliente" value="third" />
                    <Picker.Item label="Guía Propia" value="own" />
                  </StyledPicker>
                )}
              />
            </View>
          </View>

          <View className="w-full flex">
            <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mb-2 ml-1">
              No. de Guía
            </Text>
            <Controller
              control={control}
              rules={{
                required: "ESTE CAMPO ES REQUERIDO.",
                pattern: {
                  value: /^[0-9]{9}$/,
                  message: "Debe contener 9 dígitos.",
                },
              }}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Ej: 000000001"
                  onChangeText={(text) => onChange(text)}
                  onBlur={() => {
                    onBlur();
                    if (value && value.length > 0) {
                      onChange(value.padStart(9, "0"));
                    }
                  }}
                  value={value}
                  maxLength={9}
                  placeholderTextColor="#9ca3af"
                  className="color-slate-900 bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm w-full outline-none text-base font-bold h-14"
                  keyboardType="numeric"
                />
              )}
            />
          </View>
          {errors.name && (
            <Text className="font-bold text-red-500 uppercase tracking-widest text-[10px] ml-1">
              {errors.name.message as string}
            </Text>
          )}

          <View className="w-full flex">
            <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mb-2 ml-1">
              Comentario
            </Text>
            <Controller
              control={control}
              name="comment"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholderTextColor="#9ca3af"
                  className="color-slate-900 bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm w-full outline-none text-base h-24"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              )}
            />
          </View>

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
                  Guardar Guía
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClose}
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
