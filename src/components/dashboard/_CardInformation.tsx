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
    <View className="flex-1 bg-slate-900 rounded-[28px] overflow-hidden p-5 shadow-sm border border-slate-800 flex-col items-start mx-1 mb-4 relative drop-shadow-md">
      <View className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 mb-5 z-10 w-14 h-14 items-center justify-center">
        {icon === "route" && (
          <Image style={{ tintColor: '#fff', width: 26, height: 26 }} resizeMode="contain" source={require(`../../../assets/route.png`)} />
        )}
        {icon === "hours" && (
          <Image style={{ tintColor: '#fff', width: 26, height: 26 }} resizeMode="contain" source={require(`../../../assets/hours.png`)} />
        )}
        {icon === "maintenance" && (
          <Image style={{ tintColor: '#fff', width: 26, height: 26 }} resizeMode="contain" source={require(`../../../assets/maintenance.png`)} />
        )}
      </View>
      <View className="z-10 w-full">
        <Text className="text-white text-3xl font-black tracking-tight mb-2" numberOfLines={1} adjustsFontSizeToFit>
          {title}
        </Text>
        <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
          {label}
        </Text>
      </View>
      {/* Decorative background shape */}
      <View className="absolute -right-10 -bottom-10 w-36 h-36 bg-slate-800 rounded-full opacity-40 z-0 pointer-events-none" />
      <View className="absolute -left-10 -top-10 w-24 h-24 bg-slate-700 rounded-full opacity-10 z-0 pointer-events-none blur-2xl" />
    </View>
  );
}
