// components/StatusCircle.tsx
import React from "react";
import { View } from "react-native";

type StatusType = "success" | "error" | "warning" | "default";

export default function StatusCircle({
  type = "default",
  size = 10, // tailwind size: 2.5 * size roughly (w-10 -> 40px), but we'll use fixed classes below
}: {
  type?: StatusType;
  size?: number;
}) {
  // map type -> tailwind background color class
  const colorClass =
    type === "success"
      ? "bg-green-500"
      : type === "error"
        ? "bg-red-500"
        : type === "warning"
          ? "bg-yellow-500"
          : "bg-gray-300";

  // size classes examples: w-2 h-2, w-3 h-3, w-4 h-4, w-6 h-6, w-8 h-8, w-10 h-10
  // pick one reasonably small; if you prefer exact px, change to style prop instead
  const sizeClass = size === 4 ? "w-4 h-4" : size === 6 ? "w-6 h-6" : "w-3 h-3";

  return <View className={`${sizeClass} ${colorClass} rounded-full`} />;
}
