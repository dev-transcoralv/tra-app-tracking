import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Controller } from "react-hook-form";

type Props = {
  control: any;
  name: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
};

export function ImagePickerField({
  control,
  name,
  label,
  disabled,
  required,
}: Props) {
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      await ImagePicker.requestCameraPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    })();
  }, []);

  const handlePickImage = async (
    onChange: (value: string | null) => void,
    fromCamera = false,
  ) => {
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.5, base64: true })
      : await ImagePicker.launchImageLibraryAsync({
          quality: 0.5,
          base64: true,
        });

    if (!result.canceled) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      onChange(`data:image/jpeg;base64,${asset.base64}`);
    }
  };

  const handleClear = (onChange: (value: string | null) => void) => {
    setImageUri(null);
    onChange(null);
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: required ? "Este campo es obligatorio" : false }}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={{ gap: 8 }}>
          {label && <Text className="font-semibold">{label}</Text>}

          <View
            style={{
              flexDirection: "row",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <TouchableOpacity
              disabled={disabled}
              className="flex-1 py-2 bg-blue-900 items-center justify-center"
              onPress={() => !disabled && handlePickImage(onChange, true)}
            >
              <Text className="text-white">📷 Cámara</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={disabled}
              className="flex-1 py-2 bg-secondary items-center justify-center"
              onPress={() => !disabled && handlePickImage(onChange, false)}
            >
              <Text className="text-white">🖼 Galería</Text>
            </TouchableOpacity>
          </View>

          {(imageUri || value) && (
            <View style={{ gap: 8 }}>
              <Image
                source={{ uri: imageUri || value }}
                style={{ width: "100%", height: 180, borderRadius: 8 }}
                resizeMode="cover"
              />

              <TouchableOpacity
                className="p-4 bg-primary rounded-lg"
                onPress={() => handleClear(onChange)}
              >
                <Text className="text-center text-white">🗑️ Limpiar</Text>
              </TouchableOpacity>
            </View>
          )}

          {error && <Text className="text-primary">{error.message}</Text>}
        </View>
      )}
    />
  );
}
