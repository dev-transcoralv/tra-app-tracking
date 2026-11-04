import {
  getOrder,
  startTrip,
  stopTrip,
  tripFinished,
  updateTrip,
  updateHours,
} from "../order";

/**
 * Tests del cliente HTTP de órdenes (endpoints /tra/orders/* de Odoo).
 *
 * Los casos de defectos aún abiertos se marcan con `test.failing`: describen
 * el comportamiento esperado y hoy fallan. Al corregir el defecto, pasarlos a `test`.
 */

const BASE = "https://odoo.test";
const fetchMock = jest.fn();
global.fetch = fetchMock as unknown as typeof fetch;

function respond(status: number, body: unknown) {
  fetchMock.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

const ORDER = { id: 42, trip_status: "initiated" };

describe("order service: lecturas", () => {
  test("getOrder devuelve la orden cuando la respuesta es 200", async () => {
    respond(200, ORDER);
    await expect(getOrder(42)).resolves.toEqual(ORDER);
    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/tra/orders/42`);
  });

  test("getOrder lanza el mensaje de error del backend cuando la respuesta no es 2xx", async () => {
    respond(404, { error: "Orden no encontrada" });
    await expect(getOrder(42)).rejects.toBe("Orden no encontrada");
  });

  test("getOrder propaga errores de red", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Network request failed"));
    await expect(getOrder(42)).rejects.toThrow("Network request failed");
  });
});

describe("order service: iniciar/detener viaje", () => {
  test.each([
    ["startTrip", startTrip, "start_trip"],
    ["stopTrip", stopTrip, "stop_trip"],
  ])("%s hace PUT al endpoint correcto", async (_n, fn, path) => {
    respond(200, ORDER);
    await expect(fn(42)).resolves.toEqual(ORDER);
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/tra/orders/42/${path}`,
      expect.objectContaining({ method: "PUT" }),
    );
  });

  test.each([
    ["startTrip", startTrip],
    ["stopTrip", stopTrip],
  ])("%s lanza error cuando el backend responde 500", async (_n, fn) => {
    respond(500, { error: "Error interno" });
    await expect(fn(42)).rejects.toBe("Error interno");
  });
});

describe("order service: escrituras críticas", () => {
  test("updateTrip envía el payload como JSON", async () => {
    respond(200, ORDER);
    const data = { foo: "bar" } as any;
    await updateTrip(42, data);
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/tra/orders/42/update_order`,
      expect.objectContaining({ method: "PUT", body: JSON.stringify(data) }),
    );
  });

  // Regresión QA-04: tripFinished/updateTrip/updateHours ignoraban response.ok
  // y un error del backend se devolvía como una Order válida (la UI mostraba
  // un guardado exitoso).
  test("QA-04 tripFinished debe lanzar error cuando el backend responde 4xx/5xx", async () => {
    respond(400, { error: "Faltan campos obligatorios" });
    await expect(tripFinished(42)).rejects.toBe("Faltan campos obligatorios");
  });

  test("QA-04 updateTrip debe lanzar error cuando el backend responde 4xx/5xx", async () => {
    respond(500, { error: "Error interno" });
    await expect(updateTrip(42, {} as any)).rejects.toBe("Error interno");
  });

  test("QA-04 updateHours debe lanzar error cuando el backend responde 4xx/5xx", async () => {
    respond(500, { error: "Error interno" });
    await expect(updateHours(42, "arrival_date")).rejects.toBe("Error interno");
  });
});
