import { useState } from "react";
import { TouchableOpacity, Text, View, ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";
import { updateHours } from "../../services/odoo/order";
import { usePlateGeofenceStatus } from "../../utils/wialon";

type DatetimeField =
  | "arrival_point_charge_time"
  | "departure_point_charge_time"
  | "arrival_point_download_time"
  | "departure_point_download_time";

type Props = {
  datetime: string | null;
  title: string;
  orderId: number;
  field: DatetimeField;
  vehicleName: string;
  geocercaId: number | null;
  orderFinished: boolean;
  onChange: (value: string) => void;
};

export function DatetimeButtonWialon({
  orderId,
  datetime,
  title,
  field,
  vehicleName,
  geocercaId,
  orderFinished,
  onChange,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  // Initialize hook with configuration
  const { checkPlate, isInside, loading, error } = usePlateGeofenceStatus({
    sid: "YOUR_VALID_WIALON_SID", // Ideally from context/auth provider
    resourceId: vehicleName, // Replace with your Resource ID
    geofenceId: geocercaId || 1, // Replace with your Geofence ID
  });

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      checkPlate(vehicleName);

      if (error) {
        throw new Error(`Wialon Error: ${error}`);
      }
      if (isInside) {
        const order = await updateHours(orderId, field);
        onChange(String(order[field]));
      } else {
        Toast.show({
          type: "warning",
          text1: "No se encuentra en el punto.",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error?.message || String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="my-1 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
      {/* 1. Label with spacing */}
      <Text className="font-bold text-gray-800 mb-2">
        {`Fecha/Hora ${title}`}
      </Text>

      {/* 2. Row with explicit vertical alignment (items-center) */}
      <View className="flex-row justify-between items-center">
        {/* 3. Conditional styling for placeholder vs real data */}
        <Text
          className={`text-basae ${datetime ? "text-gray-900" : "text-gray-400"}`}
        >
          {datetime || "Sin registrar"}
        </Text>

        {!orderFinished && !datetime && (
          <TouchableOpacity
            // 4. Removed fixed width, added rounded corners, added opacity on loading
            className={`px-4 py-2 bg-blue-900 rounded-md min-w-[100px] items-center justify-center ${loading ? "opacity-60" : "opacity-100"}`}
            onPress={handleUpdate}
            disabled={isLoading}
            activeOpacity={0.7} // Better tap feedback
          >
            {loading ? (
              // Ensure spinner size matches text size generally
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              // Dropped extra-bold for better balance
              <Text className="color-white font-bold text-center">{title}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
