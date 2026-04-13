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
    <StyledView className="bg-blue-50 border border-blue-100 rounded-2xl p-5 w-full items-center shadow-sm my-2">
      <StyledText className="text-[10px] uppercase font-bold tracking-widest text-blue-400 mb-1">
        Tiempo En Progreso
      </StyledText>
      <StyledText className="text-4xl font-black text-blue-900 tracking-widest">
        {hours.toString().padStart(2, "0")}:
        {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </StyledText>
    </StyledView>
  );
}
