import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
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

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

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
      // Local URI for immediate display
      setImageUri(asset.uri);
      // Send full Base64 Data URI to Odoo
      onChange(`data:image/jpeg;base64,${asset.base64}`);
    }
  };

  const handleClear = (onChange: (value: string | null) => void) => {
    setImageUri(null);
    onChange(null); // Send null to Odoo to delete the image
  };

  return (
    <Controller
      control={control}
      name={name}
      // 1. ADD THIS: explicit default value prop
      defaultValue={defaultValue}
      rules={{ required: required ? "Este campo es obligatorio." : false }}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        // --- LOGIC START ---
        let displaySource = null;

        // Priority 1: User just picked a new photo (local state)
        if (imageUri) {
          displaySource = imageUri;
        }
        // Priority 2: Form value (from DB/defaultValues)
        else if (value) {
          if (
            typeof value === "string" &&
            !value.startsWith("http") &&
            !value.startsWith("data:")
          ) {
            // Fix for Odoo: Raw Base64 string
            displaySource = `data:image/png;base64,${value}`;
          } else {
            // Standard URL or Data URI
            displaySource = value;
          }
        }
        // --- LOGIC END ---

        return (
          <View>
            {/* Label Logic */}
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
                {/* Controls: Show only if no image is displayed */}
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
                          setImageUri(uri); // Update local UI
                          onChange(uri); // Update Form Data
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

                {/* Image Display */}
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
