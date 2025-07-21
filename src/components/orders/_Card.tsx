import { Pressable, Text } from "react-native";
import { Order } from "../../shared.types";
import { Link } from "expo-router";
import { cssInterop } from "nativewind";

const StyledPressable = cssInterop(Pressable, {
  className: "style",
});

export function OrderCard({ order }: { order: Order }) {
  return (
    <Link href={`orders/${order.id}`} asChild>
      <StyledPressable className="active: opacity-50 border border-black p-4">
        <Text>Order no. {order.name}</Text>
      </StyledPressable>
    </Link>
  );
}
