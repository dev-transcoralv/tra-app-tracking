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
      <View style={{ padding: 20, flex: 1 }}>
        <View className="w-full flex flex-col gap-4">
          {/* Image */}
          <ImagePickerField
            control={control}
            name="image"
            label="Foto de Guía"
          />

          <View>
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

          <View className="w-full flex items-center gap-2 bg-secondary-complementary p-2 rounded-xl">
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
                  className="color-secondary bg-transparent border-0 w-full outline-none text-sm md:text-base"
                />
              )}
              name="name"
            />
          </View>
          {errors.name &&
            Object.values(errors.name.types || {}).map((msg, i) => (
              <Text key={i} className="font-bold color-primary">
                {msg as string}
              </Text>
            ))}

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
              name="comment"
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
