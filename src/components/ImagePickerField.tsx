import { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Controller } from "react-hook-form";

type Props = {
  control: any;
  name: string;
  label?: string;
};

export function ImagePickerField({ control, name, label }: Props) {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handlePickImage = async (
    onChange: (value: string) => void,
    fromCamera = false,
  ) => {
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
      const uri = result.assets[0].uri;
      const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImageUri(uri);
      onChange(base64);
    }
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <View className="flex-col gap-2">
          {label && (
            <Text className="text-base bg-secondary text-white text-center py-1">
              {label}
            </Text>
          )}

          <View className="flex-row justify-between">
            <TouchableOpacity
              style={{
                backgroundColor: "#007AFF",
                padding: 12,
                borderRadius: 8,
                flex: 1,
                marginRight: 5,
              }}
              onPress={() => handlePickImage(onChange, true)}
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
              onPress={() => handlePickImage(onChange, false)}
            >
              <Text style={{ color: "white", textAlign: "center" }}>
                🖼 Galería
              </Text>
            </TouchableOpacity>
          </View>

          {(imageUri || value) && (
            <Image
              style={{
                width: "100%",
                height: 200,
                marginTop: 10,
                borderRadius: 10,
              }}
              source={{ uri: imageUri || undefined }}
            />
          )}
        </View>
      )}
    />
  );
}
