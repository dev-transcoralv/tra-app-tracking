import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { cssInterop } from "nativewind";

const StyledText = cssInterop(Text, {
  className: "style",
});
const StyledView = cssInterop(View, {
  className: "style",
});

type CountdownCardProps = {
  targetDate: string; // ISO string e.g. "2025-08-26T12:00:00Z"
};

export function CountdownCard({ targetDate }: CountdownCardProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = now - target;
      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const hours = Math.floor(timeLeft / 1000 / 60 / 60);
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);
  return (
    <StyledView className="bg-blue-100 rounded-xl p-4 w-full items-center">
      <StyledText className="text-2xl font-bold text-blue-800">
        {hours.toString().padStart(2, "0")}:
        {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </StyledText>
    </StyledView>
  );
}
