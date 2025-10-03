import React from "react";
import { View, Text } from "react-native";

type Props = {
  count: number | undefined;
  status: "pending" | "finished";
};

export default function DashboardCard({ count, status }: Props) {
  const statusMap = {
    pending: {
      label: "Pendientes",
      color: "bg-blue-500",
    },
    finished: {
      label: "Finalizados",
      color: "bg-green-500",
    },
  };

  const statusData = statusMap[status];

  return (
    <View className="bg-secondary-complementary rounded-xl p-4 shadow-md mb-4">
      <View className="flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-gray-800">{count}</Text>
        <View className={`px-3 py-1 rounded-full ${statusData.color}`}>
          <Text className="color-white text-l font-semibold">
            {statusData.label}
          </Text>
        </View>
      </View>
    </View>
  );
}
