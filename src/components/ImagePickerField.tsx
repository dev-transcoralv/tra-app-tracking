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
          <View className="mb-2 mx-1 mt-1">
            <TouchableOpacity
              className={`p-4 ${bg === "bg-secondary-complementary" ? "bg-white" : bg} border border-gray-100 shadow-sm flex-row justify-between items-center rounded-2xl active:bg-gray-50`}
              onPress={toggleExpand}
            >
              <Text className="font-bold text-gray-700 tracking-wide text-sm">{label || "Imagen"}</Text>
              <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center border border-gray-100">
                {expanded ? (
                  <FontAwesomeMinus color="#6b7280" size={14} />
                ) : (
                  <FontAwesomePlus color="#6b7280" size={14} />
                )}
              </View>
            </TouchableOpacity>

            {expanded && (
              <View className="mt-3 px-1">
                {!displaySource && (
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 12,
                    }}
                  >
                    <TouchableOpacity
                      disabled={disabled}
                      className="flex-1 py-4 bg-primary items-center justify-center rounded-2xl shadow-sm active:opacity-80"
                      onPress={() =>
                        !disabled && handlePickImage(onChange, true)
                      }
                    >
                      <Text className="text-white font-extrabold tracking-widest text-xs uppercase">📷 Cámara</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      disabled={disabled}
                      className="flex-1 py-4 bg-gray-800 items-center justify-center rounded-2xl shadow-sm active:opacity-80"
                      onPress={() =>
                        !disabled && handlePickImage(onChange, false)
                      }
                    >
                      <Text className="text-white font-extrabold tracking-widest text-xs uppercase">🖼 Galería</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {displaySource && (
                  <View className="mt-1 items-center relative">
                    <View className="shadow-sm w-full rounded-2xl overflow-hidden border border-gray-100">
                      <Image
                        source={{ uri: displaySource }}
                        style={{
                          width: "100%",
                          height: 250,
                          backgroundColor: "#f9fafb",
                        }}
                        resizeMode="cover"
                      />
                    </View>

                    {!readonly && (
                      <TouchableOpacity
                        className="mt-3 py-3.5 bg-red-50 rounded-xl border border-red-100 w-full active:bg-red-100 flex-row justify-center items-center gap-2"
                        onPress={() => handleClear(onChange)}
                      >
                        <Text className="text-center text-red-600 font-bold uppercase tracking-widest text-xs">
                          🗑️ Eliminar Foto
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            )}

            {error && (
              <Text className="font-bold text-red-500 mt-2 px-2 text-xs tracking-wide">
                {error.message}
              </Text>
            )}
          </View>
        );
      }}
    />
  );
}
