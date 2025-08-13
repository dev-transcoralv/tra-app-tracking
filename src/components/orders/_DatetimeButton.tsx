import { useState } from "react";
import { TouchableOpacity, Text, View, ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";
import { updateHours } from "../../services/odoo/order";

type Props = {
  datetime: string | null;
  title: string;
  orderId: number;
  field: string;
};

export function DatetimeButton({ orderId, datetime, title, field }: Props) {
  const [loading, setLoading] = useState(false);
  const update = async () => {
    try {
      setLoading(true);
      await updateHours(orderId, field);
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
        <Text className="py-3">{datetime}</Text>
        <TouchableOpacity
          style={{ width: 150 }}
          className={`px-5 py-3 items-center rounded-full bg-sky-500`}
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
      </View>
    </View>
  );
}
