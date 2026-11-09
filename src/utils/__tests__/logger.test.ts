import { describeError, logError } from "../logger";

/**
 * QA-12: los errores de axios se imprimían completos y su `config` lleva
 * el token de la API de Wialon / el `sid`. En release, console.* va a logcat.
 */

const SECRET = "WIALON-TOKEN-DE-PRUEBA";

/** Error con la forma de un AxiosError: config con params y headers. */
function axiosLikeError() {
  const err = new Error("Network Error") as Error & Record<string, unknown>;
  err.name = "AxiosError";
  err.config = {
    params: { svc: "token/login", params: JSON.stringify({ token: SECRET }) },
    headers: { Authorization: `Bearer ${SECRET}` },
  };
  return err;
}

let errorSpy: jest.SpyInstance;
const originalDev = (global as any).__DEV__;

beforeEach(() => {
  errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  (global as any).__DEV__ = originalDev;
  errorSpy.mockRestore();
});

function printed(): string {
  return errorSpy.mock.calls.map((c) => c.map(String).join(" ")).join("\n");
}

describe("describeError", () => {
  test.each([
    ["Error", new Error("Sin conexión"), "Error: Sin conexión"],
    ["string", "Orden cerrada", "Orden cerrada"],
    ["código numérico", 4, "code 4"],
    ["objeto", { token: SECRET }, "error desconocido"],
  ])("%s", (_n, input, expected) => {
    expect(describeError(input)).toBe(expected);
  });

  test("de un error de axios solo toma nombre y mensaje, nunca config", () => {
    const text = describeError(axiosLikeError());
    expect(text).toBe("AxiosError: Network Error");
    expect(text).not.toContain(SECRET);
  });
});

describe("logError", () => {
  test("en desarrollo imprime contexto y mensaje, sin el token", () => {
    (global as any).__DEV__ = true;
    logError("Wialon login", axiosLikeError());
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(printed()).toBe("Wialon login: AxiosError: Network Error");
    expect(printed()).not.toContain(SECRET);
  });

  test("en release no escribe nada", () => {
    (global as any).__DEV__ = false;
    logError("Wialon login", axiosLikeError());
    logError("Sin detalle");
    expect(errorSpy).not.toHaveBeenCalled();
  });

  test("acepta solo un contexto", () => {
    (global as any).__DEV__ = true;
    logError("No se pudo autenticar en Wialon.");
    expect(printed()).toBe("No se pudo autenticar en Wialon.");
  });
});
