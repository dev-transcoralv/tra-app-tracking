import { useState } from "react";
import { TouchableOpacity, Text, View, ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";
import { updateHours } from "../../services/odoo/order";

type DatetimeField =
  | "arrival_point_charge_time"
  | "arrival_charge_time"
  | "departure_charge_time"
  | "departure_point_charge_time"
  | "arrival_point_download_time"
  | "arrival_download_time"
  | "departure_download_time"
  | "departure_point_download_time"
  | "arrival_empty_time"
  | "departure_empty_time"
  | "generator_supplier_removal"
  | "generator_supplier_delivery";

type Props = {
  datetime: string | null;
  title: string;
  orderId: number;
  field: DatetimeField;
  orderFinished: boolean;
  onChange: (value: string) => void;
};

export function DatetimeButton({
  orderId,
  datetime,
  title,
  field,
  orderFinished,
  onChange,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const order = await updateHours(orderId, field);
      onChange(String(order[field]));
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error?.message || String(error),
      });
    } finally {
      setLoading(false);
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
            disabled={loading}
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
