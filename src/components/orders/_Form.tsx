import { Text, View } from "react-native";
import { Order } from "../../shared.types";

export function OrderForm({ order }: { order: Order }) {
  return (
    <View>
      <Text>Order no. {order.name}</Text>
    </View>
  );
}
