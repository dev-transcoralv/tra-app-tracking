import { Pressable, Text } from "react-native";
import { Order } from "../../shared.types";
import { Link } from "expo-router";
import { cssInterop } from "nativewind";
import { CountdownCard } from "../CountdownCard";

const StyledPressable = cssInterop(Pressable, {
  className: "style",
});

const StyledText = cssInterop(Text, {
  className: "style",
});

export function OrderCardSummary({ order }: { order: Order }) {
  return (
    <Link
      className="flex-1 bg-white rounded-xl p-4 shadow-md"
      href={{
        pathname: `orders/${order.id}`,
        params: { reference: order.name },
      }}
      asChild
    >
      <StyledPressable>
        <StyledText className="text-l text-primary text-center font-bold">
          {order.name}
        </StyledText>
        <StyledText className="ml-2 text-gray-800 text-center font-semibold text-sm">
          {order.partner_name}
        </StyledText>
        <StyledText className="ml-2 text-gray-800 text-center font-semibold text-sm mb-2">
          {order.route_name}
        </StyledText>
        {order.start_of_trip_iso_format && (
          <CountdownCard targetDate={order.start_of_trip_iso_format} />
        )}
      </StyledPressable>
    </Link>
  );
}
