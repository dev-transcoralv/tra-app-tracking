import React from "react";
import { View, Text, Image } from "react-native";

interface Props {
  title: string;
  label: string;
  icon: string;
}

export default function DashboardCardInformation({
  title,
  label,
  icon,
}: Props) {
  return (
    <View className="flex-1 bg-white rounded-xl p-4 shadow-md">
      <View className="flex-row justify-between items-center">
        <View>
          {icon === "route" && (
            <Image source={require(`../../../assets/route.png`)}></Image>
          )}
          {icon === "hours" && (
            <Image source={require(`../../../assets/hours.png`)}></Image>
          )}
        </View>
        <View className="ml-1 items-center">
          <Text className="text-2xl font-bold color-primary">{title}</Text>
          <Text className="text-sm font-semibold">{label}</Text>
        </View>
      </View>
    </View>
  );
}
