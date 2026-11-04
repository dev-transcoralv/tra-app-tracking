/**
 * Cliente HTTP con timeout para los endpoints de Odoo (QA-08).
 *
 * Sin timeout, una conexión móvil degradada (carretera, zonas sin cobertura)
 * dejaba la UI en "cargando" indefinidamente.
 */

/** Límite para lecturas y escrituras sin adjuntos. */
export const DEFAULT_TIMEOUT_MS = 20_000;

/** Límite para peticiones que suben fotos en base64 o descargan PDFs. */
export const UPLOAD_TIMEOUT_MS = 60_000;

/**
 * Una escritura que agota el tiempo pudo haber llegado al servidor, por eso
 * se pide verificar antes de reintentar.
 */
export const TIMEOUT_MESSAGE =
  "El servidor no respondió a tiempo. Revise su conexión; si estaba guardando, actualice antes de reintentar.";

export class RequestTimeoutError extends Error {
  constructor(message: string = TIMEOUT_MESSAGE) {
    super(message);
    this.name = "RequestTimeoutError";
  }
}

type FetchInit = NonNullable<Parameters<typeof fetch>[1]>;

export async function fetchWithTimeout(
  input: string,
  init: FetchInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // Los tipos DOM y los de React Native declaran AbortSignal distinto; en
    // runtime es el mismo objeto (RN soporta AbortController desde 0.60).
    const signal = controller.signal as unknown as FetchInit["signal"];
    return await fetch(input, { ...init, signal });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new RequestTimeoutError();
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
