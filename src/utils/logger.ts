/**
 * Registro de errores sin datos sensibles (QA-12).
 *
 * En builds de release `console.*` termina en el log del sistema (logcat),
 * legible por adb. Antes se registraban coordenadas GPS, el push token y
 * errores de axios completos, cuyo `config` incluye el token de la API de
 * Wialon y el `sid` de sesión.
 *
 * - Solo escribe en desarrollo (`__DEV__`).
 * - Nunca imprime el objeto de error: solo su nombre y mensaje.
 */

/** Resume un error a texto sin exponer config, headers ni payloads. */
export function describeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message ? `${error.name}: ${error.message}` : error.name;
  }
  if (typeof error === "string") return error;
  if (typeof error === "number") return `code ${error}`;
  return "error desconocido";
}

export function logError(context: string, error?: unknown): void {
  if (!__DEV__) return;
  // eslint-disable-next-line no-console
  console.error(
    error === undefined ? context : `${context}: ${describeError(error)}`,
  );
}
