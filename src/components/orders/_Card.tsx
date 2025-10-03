import { Pressable, Text, View } from "react-native";
import { Order } from "../../shared.types";
import { Link } from "expo-router";
import { cssInterop } from "nativewind";
import { FontAwesome5Route } from "../Icons";
import StatusCircle from "../StatusCircle";

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
      className="bg-secondary-complementary rounded-xl p-4 shadow-md mb-4 relative"
      href={{
        pathname: `orders/${order.id}`,
        params: { reference: order.name },
      }}
      asChild
    >
      <StyledPressable>
        {/* Badges */}
        {order.trip_status === "initiated" && (
          <View>
            <View className="absolute top-2 right-2 bg-blue-500 px-2 py-1 rounded-full z-10">
              <Text className="color-white text-m font-bold">Iniciado</Text>
            </View>
            <View className="absolute top-12 right-2 z-10">
              {order.status_arrival === "done" ? (
                <StatusCircle type="success" size={6} />
              ) : (
                <StatusCircle type="error" size={6} />
              )}
            </View>
          </View>
        )}

        {order.trip_status === "finished" && (
          <View className="absolute top-2 right-2 bg-green-500 px-2 py-1 rounded-full z-10">
            <Text className="color-white text-m font-bold">Finalizado</Text>
          </View>
        )}

        <StyledText className="text-l text-primary font-bold">
          {order.name}
        </StyledText>
        <StyledView className="flex-row items-center my-1">
          <FontAwesome5Route props={{ size: 2 }} />
          <StyledText className="ml-2 text-gray-800 font-semibold text-sm">
            {order.route_name}
          </StyledText>
        </StyledView>
        <StyledView className="flex-row">
          <StyledText className="font-bold text-sm">
            Tipo de Negocio:
          </StyledText>
          <StyledText className="ml-1 text-gray-800 font-semibold text-sm">
            {order.business_name}
            {order.business_code === "containers" && (
              <View className="flex-row">
                <Text className="mx-1 font-bold text-sm color-blue-500">-</Text>
                <StyledText className="text-gray-800 font-semibold text-sm">
                  {order.container_type_value}
                </StyledText>
              </View>
            )}
          </StyledText>
        </StyledView>
        <StyledView className="flex-row flex-wrap">
          <StyledText className="font-bold text-sm">Cliente:</StyledText>
          <StyledText className="ml-1 text-gray-800 font-semibold text-sm text-wrap">
            {order.partner_name}
          </StyledText>
        </StyledView>
        <StyledView className="flex-row">
          <StyledText className="font-bold text-sm">Placa:</StyledText>
          <StyledText className="ml-1 text-gray-800 font-semibold text-sm">
            {order.vehicle_name}
          </StyledText>
          {order.chassis && (
            <View className="flex-row">
              <Text className="mx-1 font-bold text-sm color-blue-500">
                con acople
              </Text>
              <StyledText className="text-gray-800 font-semibold text-sm">
                {order.chassis.name}
              </StyledText>
            </View>
          )}
        </StyledView>
        <StyledView className="flex-row">
          <StyledText className="font-bold text-sm">
            Fecha/Hora ETA Carga:
          </StyledText>
          <StyledText className="ml-1 text-gray-800 font-semibold text-sm">
            {order.eta_charge}
          </StyledText>
        </StyledView>
      </StyledPressable>
    </Link>
  );
}
