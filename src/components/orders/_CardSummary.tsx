import { Pressable, Text, View } from "react-native";
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
      className="flex-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mx-1 mb-3"
      href={{
        pathname: `orders/${order.id}`,
        params: { reference: order.name },
      }}
      asChild
    >
      <StyledPressable>
        <StyledText className="text-xl text-gray-900 text-center font-extrabold tracking-tight mb-1">
          {order.name}
        </StyledText>
        <StyledText className="text-gray-400 text-center font-bold text-[10px] uppercase tracking-widest mb-1.5">
          {order.partner_name}
        </StyledText>
        <View className="bg-slate-50 border border-slate-100 py-1.5 px-4 rounded-xl self-center mb-4">
          <StyledText className="text-gray-800 text-center font-semibold text-xs tracking-wide">
            {order.route_name}
          </StyledText>
        </View>
        {order.start_of_trip_iso_format && (
          <CountdownCard startDate={order.start_of_trip_iso_format} />
        )}
      </StyledPressable>
    </Link>
  );
}
