import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { cssInterop } from "nativewind";

const StyledView = cssInterop(View, {
  className: "style",
});
const StyledText = cssInterop(Text, {
  className: "style",
});

type JourneyTimerProps = {
  startDate: string;
};

/**
 * Parsea una fecha de manera segura compatible con Hermes (Android/iOS Release builds).
 * Hermes falla y devuelve NaN con formatos 'YYYY-MM-DD HH:mm:ss' o formatos sin 'T'.
 * Además, las fechas de Odoo se entregan en UTC; si no tienen 'Z' o zona horaria,
 * se añade 'Z' para evitar que se interpreten en hora local con desfase negativo.
 */
function parseDateSafely(dateStr: string): number | null {
  if (!dateStr || typeof dateStr !== "string") return null;

  let normalized = dateStr.trim();

  // Caso 1: 'DD/MM/YYYY HH:mm:ss' o 'DD/MM/YYYY'
  if (/^\d{2}\/\d{2}\/\d{4}/.test(normalized)) {
    const [dPart, tPart] = normalized.split(" ");
    const [d, m, y] = dPart.split("/");
    normalized = `${y}-${m}-${d}T${tPart || "00:00:00"}Z`;
  }

  // Caso 2: 'YYYY-MM-DD HH:mm:ss' (formato Odoo estándar con espacio) -> convertir a ISO con 'T'
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(normalized)) {
    normalized = normalized.replace(" ", "T");
  }

  // Caso 3: ISO sin zona horaria ('YYYY-MM-DDTHH:mm:ss') -> Odoo trabaja en UTC, agregar 'Z'
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(normalized)) {
    normalized += "Z";
  }

  const timestamp = new Date(normalized).getTime();
  return isNaN(timestamp) ? null : timestamp;
}

export function CountdownCard({ startDate }: JourneyTimerProps) {
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    const start = parseDateSafely(startDate);

    if (start === null) return;

    const updateTimer = () => {
      const now = Date.now();
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
    <StyledView
      className="bg-blue-50 border border-blue-100 rounded-2xl p-5 w-full items-center shadow-sm my-2"
      style={{
        backgroundColor: "#eff6ff",
        borderColor: "#dbeafe",
        borderWidth: 1,
        borderRadius: 16,
        padding: 20,
        width: "100%",
        alignItems: "center",
        marginVertical: 8,
      }}
    >
      <StyledText
        className="text-[10px] uppercase font-bold tracking-widest text-blue-400 mb-1"
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          fontWeight: "bold",
          letterSpacing: 1.5,
          color: "#60a5fa",
          marginBottom: 4,
        }}
      >
        Tiempo de Viaje
      </StyledText>
      <StyledText
        className="text-4xl font-black text-blue-900"
        style={{
          fontSize: 36,
          fontWeight: "900",
          color: "#1e3a8a",
        }}
      >
        {format(hours)}:{format(minutes)}:{format(seconds)}
      </StyledText>
    </StyledView>
  );
}
