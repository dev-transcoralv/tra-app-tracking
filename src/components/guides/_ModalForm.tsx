import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Guide, Order } from "../../shared.types";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { createOrUpdateGuide } from "../../services/odoo/guide";

type Props = {
  visible: boolean;
  guide: Guide | null;
  onClose: () => void;
  order: Order;
  onSave: (guide: Guide) => void;
};

type FormData = {
  id: number | null;
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
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormData>({
    criteriaMode: "all",
    defaultValues: {
      comment: "",
      image: "",
    },
  });

  const handlePickImage = async (fromCamera = false) => {
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.5,
          base64: true,
        })
      : await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          quality: 0.5,
          base64: true,
        });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setValue("image", `data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await createOrUpdateGuide(
        order.id,
        data?.id,
        data.name,
        data.comment,
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
    }
  };

  useEffect(() => {
    if (guide) {
      reset({
        id: guide.id,
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
          <View className="flex-row justify-between">
            <TouchableOpacity
              style={{
                backgroundColor: "#007AFF",
                padding: 12,
                borderRadius: 8,
                flex: 1,
                marginRight: 5,
              }}
              onPress={() => handlePickImage(true)}
            >
              <Text style={{ color: "white", textAlign: "center" }}>
                📷 Tomar Foto
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: "#34C759",
                padding: 12,
                borderRadius: 8,
                flex: 1,
                marginLeft: 5,
              }}
              onPress={() => handlePickImage(false)}
            >
              <Text style={{ color: "white", textAlign: "center" }}>
                🖼 Galería
              </Text>
            </TouchableOpacity>
          </View>
          {imageUri && (
            <Image
              style={{
                width: "100%",
                height: 200,
                marginBottom: 10,
                borderRadius: 10,
              }}
              source={{ uri: imageUri }}
            />
          )}

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
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
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
