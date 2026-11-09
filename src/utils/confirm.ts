import { Alert } from "react-native";

/**
 * Pide confirmación antes de una acción destructiva (QA-10).
 *
 * Resuelve `true` solo si el usuario pulsa "Eliminar". Cancelar, tocar
 * fuera del diálogo (Android) o el botón atrás resuelven `false`.
 */
export function confirmDelete(
  title: string,
  message: string,
): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

/** Texto legible para un toast a partir de un error de servicio. */
export function errorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error && error.message) return error.message;
  return "Ocurrió un error inesperado.";
}
