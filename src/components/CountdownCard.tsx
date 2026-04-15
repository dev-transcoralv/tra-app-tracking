import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";

// Eliminamos cssInterop si da problemas, ya que NativeWind v4+
// suele manejar View y Text automáticamente.

type JourneyTimerProps = {
  startDate: string;
};

export function CountdownCard({ startDate }: JourneyTimerProps) {
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    const start = new Date(startDate).getTime();

    if (isNaN(start)) return; // Evita errores si la fecha es inválida

    const updateTimer = () => {
      const now = Date.now();
      // DIFERENCIA POSITIVA: El ahora (más grande) menos el inicio (más pequeño)
      const diff = now - start;
      setElapsedTime(diff > 0 ? diff : 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
  const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
  const seconds = Math.floor((elapsedTime / 1000) % 60);

  const format = (num: number) => num.toString().padStart(2, "0");

  return (
    <View className="bg-blue-50 border border-blue-100 rounded-2xl p-5 w-full items-center shadow-sm my-2">
      <Text className="text-[10px] uppercase font-bold tracking-widest text-blue-400 mb-1">
        Tiempo de Viaje
      </Text>
      <Text className="text-4xl font-black text-blue-900">
        {format(hours)}:{format(minutes)}:{format(seconds)}
      </Text>
    </View>
  );
}
