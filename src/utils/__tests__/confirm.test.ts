import { Alert, AlertButton, AlertOptions } from "react-native";
import { confirmDelete, errorMessage } from "../confirm";

afterEach(() => jest.restoreAllMocks());

function lastAlert(spy: jest.SpyInstance) {
  const [, , buttons, options] = spy.mock.calls.at(-1) as [
    string,
    string,
    AlertButton[],
    AlertOptions,
  ];
  return { buttons, options };
}

describe("confirmDelete", () => {
  test("resuelve true al pulsar Eliminar (estilo destructivo)", async () => {
    const spy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const p = confirmDelete("Eliminar", "¿Seguro?");
    const { buttons } = lastAlert(spy);
    const del = buttons.find((b) => b.text === "Eliminar")!;
    expect(del.style).toBe("destructive");
    del.onPress!();
    await expect(p).resolves.toBe(true);
  });

  test("resuelve false al pulsar Cancelar", async () => {
    const spy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const p = confirmDelete("Eliminar", "¿Seguro?");
    lastAlert(spy).buttons.find((b) => b.text === "Cancelar")!.onPress!();
    await expect(p).resolves.toBe(false);
  });

  test("resuelve false si el diálogo se descarta (Android)", async () => {
    const spy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const p = confirmDelete("Eliminar", "¿Seguro?");
    lastAlert(spy).options.onDismiss!();
    await expect(p).resolves.toBe(false);
  });
});

describe("errorMessage", () => {
  test.each([
    ["string del backend", "Orden cerrada", "Orden cerrada"],
    ["Error", new Error("Sin conexión"), "Sin conexión"],
    ["valor desconocido", { foo: 1 }, "Ocurrió un error inesperado."],
    ["Error sin mensaje", new Error(""), "Ocurrió un error inesperado."],
  ])("%s", (_n, input, expected) => {
    expect(errorMessage(input)).toBe(expected);
  });
});
