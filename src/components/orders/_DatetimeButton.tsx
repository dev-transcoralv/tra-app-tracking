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
            className={`px-5 py-2.5 bg-blue-50 rounded-xl border border-blue-100 items-center justify-center ${loading ? "opacity-60" : "active:bg-blue-100"}`}
            onPress={handleUpdate}
            disabled={loading}
            activeOpacity={0.7} // Better tap feedback
          >
            {loading ? (
              // Ensure spinner size matches text size generally
              <ActivityIndicator size="small" color="#3b82f6" />
            ) : (
              // Dropped extra-bold for better balance
              <Text className="color-blue-600 font-bold text-center text-xs tracking-widest uppercase">{title}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
