import React from "react";
import { View, Text } from "react-native";

type Props = {
  count: number | undefined;
  status: "pending" | "finished";
};

export default function DashboardCard({ count, status }: Props) {
  const isPending = status === "pending";

  return (
    <View
      className={`rounded-[28px] p-6 shadow-sm border mb-4 flex-row items-center justify-between mx-1 ${
        isPending
          ? "bg-blue-50 border-blue-100"
          : "bg-emerald-50 border-emerald-100"
      }`}
    >
      <View>
        <Text
          className={`font-extrabold uppercase text-xs tracking-widest mb-1 ${
            isPending ? "text-blue-600" : "text-emerald-600"
          }`}
        >
          {isPending ? "Viajes Pendientes" : "Viajes Finalizados"}
        </Text>
        <Text
          className={`text-5xl font-black tracking-tight ${
            isPending ? "text-blue-950" : "text-emerald-950"
          }`}
        >
          {count !== undefined ? count : 0}
        </Text>
      </View>
      <View
        className={`w-14 h-14 rounded-2xl items-center justify-center ${
          isPending ? "bg-blue-100" : "bg-emerald-100"
        }`}
      >
        <View
          className={`w-4 h-4 rounded-full ${
            isPending ? "bg-blue-500 shadow-sm" : "bg-emerald-500 shadow-sm"
          }`}
        />
      </View>

      {/* Glow decorative shape in background */}
      <View
        className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20 pointer-events-none ${
          isPending ? "bg-blue-300" : "bg-emerald-300"
        }`}
      />
    </View>
  );
}
