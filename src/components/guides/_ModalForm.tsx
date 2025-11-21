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
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View className="flex p-4">
        <Text className="font-extrabold text-lg color-blue-900 text-center mb-4">
          {guide ? "*** EDITAR GUÍA ***" : "*** CREAR GUÍA ***"}
        </Text>
        <View className="w-full flex flex-col gap-4">
          {/* Image */}
          <ImagePickerField
            control={control}
            name="image"
            label="Foto de Guía"
            // defaultValue is handled by useForm/Controller now, but keeping prop is fine
            defaultValue={guide?.image || ""}
            required={true}
          />

          <View>
            <Text className="font-semibold mb-1">Tipo:</Text>
            <Controller
              control={control}
              rules={{
                required: "Este campo es requerido.",
              }}
              name="type"
              render={({ field: { onChange, value } }) => (
                <StyledPicker
                  selectedValue={value}
                  onValueChange={(itemValue) => onChange(itemValue)}
                  className="bg-secondary-complementary"
                >
                  <Picker.Item label="Cliente" value="third" />
                  <Picker.Item label="Propia" value="own" />
                </StyledPicker>
              )}
            />
          </View>

          <View className="w-full flex gap-2">
            <Text className="font-semibold mb-1">No. de Guía:</Text>
            <Controller
              control={control}
              rules={{
                required: "Este campo es requerido.",
                pattern: {
                  value: /^[0-9]{9}$/, // solo 9 dígitos
                  message:
                    "No. de documento incorrecto (debe tener 9 dígitos).",
                },
              }}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="p.e 000000001"
                  onChangeText={(text) => onChange(text)}
                  onBlur={() => {
                    onBlur();
                    if (value && value.length > 0) {
                      onChange(value.padStart(9, "0"));
                    }
                  }}
                  value={value}
                  maxLength={9}
                  placeholderTextColor="#211915"
                  className="color-secondary bg-secondary-complementary p-2 rounded-xl border-0 w-full outline-none text-sm md:text-base"
                  keyboardType="numeric"
                />
              )}
            />
          </View>
          {errors.name && (
            <Text className="font-bold color-primary">
              {errors.name.message as string}
            </Text>
          )}

          <View className="w-full flex gap-2">
            <Text className="font-semibold mb-1">Comentario:</Text>
            <Controller
              control={control}
              name="comment"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholderTextColor="#211915"
                  className="color-secondary bg-secondary-complementary p-2 rounded-xl border-0 w-full outline-none text-sm md:text-base"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              )}
            />
          </View>

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
              onPress={handleClose}
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
