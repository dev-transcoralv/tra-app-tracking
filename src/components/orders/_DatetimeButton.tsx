import { useState } from "react";
import { TouchableOpacity, Text, View, ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";
import { updateHours } from "../../services/odoo/order";

type DatetimeField =
  | "arrival_charge_time"
  | "arrival_download_time"
  | "departure_charge_time"
  | "departure_download_time";

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
  const update = async () => {
    try {
      setLoading(true);
      await updateHours(orderId, field);
      const order = await updateHours(orderId, field);
      onChange(String(order[field]));
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text className="font-bold">{`Fecha/Hora ${title}`}</Text>
      <View className="flex-row justify-between">
        <Text className="py-1">{datetime || "00/00/0000 00:00:00"}</Text>
        {!orderFinished && (
          <TouchableOpacity
            style={{ width: 150 }}
            className={`px-4 py-2 items-center rounded-full bg-blue-900`}
            onPress={() => update()}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View className="items-center">
                <Text className="text-white font-extrabold">{title}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
