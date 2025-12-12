import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  LayoutAnimation,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Controller } from "react-hook-form";
import { FontAwesomeMinus, FontAwesomePlus } from "./Icons";

type Props = {
  control: any;
  name: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  bg?: string;
  defaultValue?: string;
  readonly?: boolean;
};

export function ImagePickerField({
  control,
  name,
  label,
  disabled,
  required,
  bg = "bg-secondary-complementary",
  defaultValue = "",
  readonly = false,
}: Props) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    // LayoutAnimation works automatically in Fabric
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  useEffect(() => {
    (async () => {
      // It is good practice to catch errors here in case the user denies
      // permissions permanently, preventing the app from crashing.
      try {
        await ImagePicker.requestCameraPermissionsAsync();
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      } catch (error) {
        console.warn("Permission request failed", error);
      }
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

      // OPTIMIZATION: Ensure MIME type consistency.
      // If the picker returns a jpeg, we explicitly prefix it as jpeg.
      // If asset.type or uri implies png, adjust accordingly.
      // For general safety, 'image/jpeg' is usually safe for camera photos.
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
      defaultValue={defaultValue}
      rules={{ required: required ? "Este campo es obligatorio." : false }}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        let displaySource = null;

        if (imageUri) {
          displaySource = imageUri;
        } else if (value) {
          if (
            typeof value === "string" &&
            !value.startsWith("http") &&
            !value.startsWith("data:")
          ) {
            // FIX: You were saving as image/jpeg in handlePickImage
            // but displaying as image/png here. I changed this to jpeg
            // to match the saving logic, though browsers often handle mismatches fine.
            displaySource = `data:image/jpeg;base64,${value}`;
          } else {
            displaySource = value;
          }
        }

        return (
          <View>
            <TouchableOpacity
              className={`p-4 ${bg || "bg-white"} justify-between flex-row rounded-lg`}
              onPress={toggleExpand}
            >
              <Text className="font-semibold">{label}</Text>
              {expanded ? (
                <FontAwesomeMinus color="grey" size={14} />
              ) : (
                <FontAwesomePlus color="grey" size={14} />
              )}
            </TouchableOpacity>

            {expanded && (
              <View className="mt-2">
                {!displaySource && (
                  <View
                    style={{
                      flexDirection: "row",
                      borderRadius: 8,
                      overflow: "hidden",
                      gap: 10,
                    }}
                  >
                    <TouchableOpacity
                      disabled={disabled}
                      className="flex-1 py-3 bg-blue-900 items-center justify-center rounded-lg"
                      onPress={() =>
                        !disabled &&
                        handlePickImage((uri) => {
                          setImageUri(uri);
                          onChange(uri);
                        }, true)
                      }
                    >
                      <Text className="text-white font-medium">📷 Cámara</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      disabled={disabled}
                      className="flex-1 py-3 bg-gray-500 items-center justify-center rounded-lg"
                      onPress={() =>
                        !disabled &&
                        handlePickImage((uri) => {
                          setImageUri(uri);
                          onChange(uri);
                        }, false)
                      }
                    >
                      <Text className="text-white font-medium">🖼 Galería</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {displaySource && (
                  <View className="mt-2 items-center relative">
                    <Image
                      source={{ uri: displaySource }}
                      style={{
                        width: "100%",
                        height: 250,
                        borderRadius: 8,
                        backgroundColor: "#f0f0f0",
                      }}
                      resizeMode="cover"
                    />

                    {!readonly && (
                      <TouchableOpacity
                        className="mt-2 p-3 bg-primary rounded-lg w-full"
                        onPress={() => handleClear(onChange)}
                      >
                        <Text className="text-center text-white font-bold">
                          🗑️ Eliminar Foto
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            )}

            {error && (
              <Text className="font-bold color-primary">{error.message}</Text>
            )}
          </View>
        );
      }}
    />
  );
}
