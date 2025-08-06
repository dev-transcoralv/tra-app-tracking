import { Pressable, Text, View } from "react-native";
import { Order } from "../../shared.types";
import { Link } from "expo-router";
import { cssInterop } from "nativewind";
import { FontAwesome5Route } from "../Icons";

const StyledPressable = cssInterop(Pressable, {
  className: "style",
});
const StyledView = cssInterop(View, {
  className: "style",
});
const StyledText = cssInterop(Text, {
  className: "style",
});

export function OrderCard({ order }: { order: Order }) {
  return (
    <Link
      className="bg-secondary-complementary rounded-xl p-4 shadow-md mb-4"
      href={`orders/${order.id}`}
      asChild
    >
      <StyledPressable>
        <StyledText className="text-sm text-gray-500 mb-1 font-bold">
          {order.name}
        </StyledText>
        <StyledView className="flex-row items-center mb-2">
          <FontAwesome5Route props={{ size: 2 }} />
          <StyledText className="ml-2 text-gray-800 font-semibold text-sm">
            {order.route_name}
          </StyledText>
        </StyledView>
        <StyledView className="flex-row items-center mb-2">
          <StyledText className="ml-2 font-bold text-sm">Cliente:</StyledText>
          <StyledText className="ml-2 text-gray-800 font-semibold text-sm">
            {order.partner_name}
          </StyledText>
        </StyledView>
        <StyledView className="flex-row items-center mb-2">
          <StyledText className="ml-2 font-bold text-sm">
            Fecha/Hora:
          </StyledText>
          <StyledText className="ml-2 text-gray-800 font-semibold text-sm">
            {order.eta_charge}
          </StyledText>
        </StyledView>
      </StyledPressable>
    </Link>
  );
}
