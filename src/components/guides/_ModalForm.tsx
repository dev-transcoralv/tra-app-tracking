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

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    criteriaMode: "all",
    defaultValues: {
      comment: "",
      image: "",
      type: "third",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const guide = await createOrUpdateGuide(order.id, data);
      onSave(guide);
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
          (data.id && "Guía editada correctamente.") ||
          "Guía creada correctamente.",
      });
      setLoading(false);
      reset();
      onClose();
    }
  };

  useEffect(() => {
    if (guide) {
      reset({
        id: guide.id,
        type: guide.type,
        name: guide.name,
        comment: guide.comment,
        image: guide.image,
      });
    }
  }, [guide, reset]);

  useEffect(() => {
    return () => {
      // Cleanup logic on unmount (when modal is destroyed)
    };
  }, []);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex p-4">
        <Text className="font-extrabold text-lg color-blue-900 text-center mb-4">
          {(guide && "*** EDITAR GUÍA ***") || "*** CREAR GUÍA ***"}
        </Text>
        <View className="w-full flex flex-col gap-4">
          {/* Image */}
          <ImagePickerField
            control={control}
            name="image"
            label="* Foto de Guía"
            required={true}
          />

          <View>
            <Text className="font-semibold mb-1">* Tipo:</Text>
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
            <Text className="font-semibold mb-1">* No. de Guía:</Text>
            <Controller
              control={control}
              rules={{
                required: "Este campo es requerido.",
                pattern: {
                  value: /^[0-9]{9}$/, // solo 10 dígitos
                  message: "No. de documento incorrecto.",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="p.e 000000001"
                  onChangeText={(text) => onChange(text)}
                  onBlur={() => {
                    if (value.length !== 0) {
                      onChange(value.padStart(9, "0"));
                    }
                  }}
                  value={value}
                  maxLength={9}
                  placeholderTextColor="#211915"
                  className="color-secondary bg-secondary-complementary p-2 rounded-xl border-0 w-full outline-none text-sm md:text-base"
                />
              )}
              name="name"
            />
          </View>
          {errors.name &&
            Object.values(errors.name.types || {}).map((msg, i) => (
              <Text key={i} className="color-primary">
                {msg as string}
              </Text>
            ))}

          <View className="w-full flex gap-2">
            <Text className="font-semibold mb-1">Comentario:</Text>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="p.e. Todo correcto"
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
              name="comment"
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
