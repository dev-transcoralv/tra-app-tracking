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
      href={{
        pathname: `orders/${order.id}`,
        params: { reference: order.name },
      }}
      asChild
    >
      <StyledPressable className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4 ml-1 mr-1">
        {/* Header: Name and Status */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 pr-2">
            <StyledText className="text-xl font-extrabold text-gray-900 tracking-tight">
              {order.name}
            </StyledText>
            <View className="flex-row items-center mt-1">
              <FontAwesome5Route props={{ size: 12, color: "#6b7280" }} />
              <StyledText
                className="ml-1.5 text-gray-500 font-medium text-sm"
                numberOfLines={1}
              >
                {order.route_name}
              </StyledText>
            </View>
          </View>

          <View className="items-end gap-y-2">
            {order.trip_status === "initiated" && (
              <View className="flex-row items-center bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                <View className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
                <Text className="color-blue-700 text-xs font-bold uppercase tracking-widest">
                  Iniciado
                </Text>
              </View>
            )}

            {order.trip_status === "finished" && (
              <View className="flex-row items-center bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                <Text className="color-emerald-700 text-xs font-bold uppercase tracking-widest">
                  Finalizado
                </Text>
              </View>
            )}

            {order.trip_status === "initiated" && (
              <View className="mt-1 flex-row items-center">
                <StyledText className="text-[10px] text-gray-400 font-semibold mr-1 uppercase">
                  Arrival:
                </StyledText>
                {order.status_arrival === "done" ? (
                  <StatusCircle type="success" size={5} />
                ) : (
                  <StatusCircle type="error" size={5} />
                )}
              </View>
            )}
          </View>
        </View>

        {/* Divider */}
        <View className="h-[1px] w-full bg-gray-100 my-2" />

        {/* Details Grid */}
        <View className="flex-col gap-y-2.5 mt-2">
          <View className="flex-row items-start">
            <StyledText className="text-gray-400 font-bold text-xs uppercase w-24 tracking-wider mt-0.5">
              Negocio
            </StyledText>
            <View className="flex-1 flex-row flex-wrap">
              <StyledText className="text-gray-800 font-semibold text-sm">
                {order.business_name}
              </StyledText>
              {order.business_code === "containers" && (
                <StyledText className="text-blue-600 font-semibold text-sm">
                  {" • "}
                  {order.container_type_value}
                </StyledText>
              )}
            </View>
          </View>

          <View className="flex-row items-start">
            <StyledText className="text-gray-400 font-bold text-xs uppercase w-24 tracking-wider mt-0.5">
              Cliente
            </StyledText>
            <StyledText
              className="flex-1 text-gray-800 font-semibold text-sm"
              numberOfLines={1}
            >
              {order.partner_name}
            </StyledText>
          </View>

          <View className="flex-row items-center">
            <StyledText className="text-gray-400 font-bold text-xs uppercase w-24 tracking-wider">
              Placa
            </StyledText>
            <View className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
              <StyledText className="text-gray-900 font-extrabold text-xs tracking-widest uppercase">
                {order.vehicle_name}
              </StyledText>
            </View>
            {order.chassis && (
              <StyledText className="ml-2 text-xs text-gray-500 font-medium">
                acople {order.chassis.name}
              </StyledText>
            )}
          </View>

          <View className="bg-amber-50 rounded-lg p-2.5 border border-amber-100 flex-row items-center mt-1">
            <StyledText className="text-amber-800 font-bold text-xs uppercase mr-2 tracking-wider">
              ETA Carga:
            </StyledText>
            <StyledText className="text-amber-900 font-bold text-sm">
              {order.eta_charge}
            </StyledText>
          </View>

          {order.business_code === "grain" && (
            <View className="flex-row items-start mt-1">
              <StyledText className="text-gray-400 font-bold text-xs uppercase w-24 tracking-wider">
                Material
              </StyledText>
              <StyledText className="flex-1 text-gray-800 font-semibold text-sm">
                {order.material_name}
              </StyledText>
            </View>
          )}

          {order.information && (
            <View className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
              <StyledText className="text-slate-400 font-bold text-[10px] uppercase mb-1 tracking-wider">
                Información
              </StyledText>
              <StyledText className="text-slate-700 text-sm italic">
                {order.information}
              </StyledText>
            </View>
          )}
        </View>
      </StyledPressable>
    </Link>
  );
}
