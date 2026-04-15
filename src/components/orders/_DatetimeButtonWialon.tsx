import { useState } from "react";
import { TouchableOpacity, Text, View, ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";
import { updateHours } from "../../services/odoo/order";
// TODO import { usePlateGeofenceStatus } from "../../utils/wialon";

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
  /**
  const { checkPlate, isInside, loading, error } = usePlateGeofenceStatus({
    sid: "YOUR_VALID_WIALON_SID", // Ideally from context/auth provider
    resourceId: vehicleName, // Replace with your Resource ID
    geofenceId: geocercaId || 1, // Replace with your Geofence ID
  });
   */

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      /**
      checkPlate(vehicleName);

      if (error) {
        throw new Error(`Wialon Error: ${error}`);
      }
      */
      if (true /*isInside*/) {
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
    <View className="mb-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mx-1">
      {/* 1. Label with spacing */}
      <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mb-2 pl-1">
        {`Fecha/Hora ${title}`}
      </Text>

      {/* 2. Row with explicit vertical alignment (items-center) */}
      <View className="flex-row justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
        {/* 3. Conditional styling for placeholder vs real data */}
        <Text
          className={`text-sm font-semibold pl-2 ${datetime ? "text-gray-900" : "text-gray-400 italic"}`}
        >
          {datetime || "Sin registrar"}
        </Text>

        {!orderFinished && !datetime && (
          <TouchableOpacity
            // 4. Removed fixed width, added rounded corners, added opacity on loading
            className={`px-5 py-2.5 bg-blue-50 rounded-xl border border-blue-100 items-center justify-center ${isLoading ? "opacity-60" : "active:bg-blue-100"}`}
            onPress={handleUpdate}
            disabled={isLoading}
            activeOpacity={0.7} // Better tap feedback
          >
            {isLoading ? (
              // Ensure spinner size matches text size generally
              <ActivityIndicator size="small" color="#3b82f6" />
            ) : (
              // Dropped extra-bold for better balance
              <Text className="color-blue-600 font-bold text-center text-xs tracking-widest uppercase">
                {title}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
