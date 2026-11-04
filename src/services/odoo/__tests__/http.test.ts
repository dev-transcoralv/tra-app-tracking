import {
  fetchWithTimeout,
  RequestTimeoutError,
  DEFAULT_TIMEOUT_MS,
  UPLOAD_TIMEOUT_MS,
  TIMEOUT_MESSAGE,
} from "../http";
import { getOrder, updateTrip } from "../order";

/**
 * QA-08: las peticiones a Odoo no tenían timeout. Con mala señal en
 * carretera la pantalla quedaba cargando indefinidamente.
 */

const fetchMock = jest.fn();
global.fetch = fetchMock as unknown as typeof fetch;

/** fetch que nunca responde, pero respeta el AbortSignal como el real. */
function hangingFetch() {
  fetchMock.mockImplementationOnce(
    (_url: string, init?: RequestInit) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const err = new Error("Aborted");
          err.name = "AbortError";
          reject(err);
        });
      }),
  );
}

function okResponse(body: unknown = {}) {
  return { ok: true, status: 200, json: async () => body };
}

beforeEach(() => {
  jest.useFakeTimers();
  fetchMock.mockReset();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("fetchWithTimeout", () => {
  test("devuelve la respuesta si llega antes del límite y no deja timers vivos", async () => {
    const res = okResponse();
    fetchMock.mockResolvedValueOnce(res);
    await expect(fetchWithTimeout("https://odoo.test/x")).resolves.toBe(res);
    expect(jest.getTimerCount()).toBe(0);
  });

  test("pasa las opciones originales más un AbortSignal", async () => {
    fetchMock.mockResolvedValueOnce(okResponse());
    await fetchWithTimeout("https://odoo.test/x", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://odoo.test/x",
      expect.objectContaining({
        method: "PUT",
        body: "{}",
        signal: expect.any(Object),
      }),
    );
  });

  test("rechaza con RequestTimeoutError al superar el límite por defecto", async () => {
    hangingFetch();
    const p = fetchWithTimeout("https://odoo.test/x");
    const assertion = expect(p).rejects.toBeInstanceOf(RequestTimeoutError);
    jest.advanceTimersByTime(DEFAULT_TIMEOUT_MS);
    await assertion;
    await expect(p).rejects.toThrow(TIMEOUT_MESSAGE);
  });

  test("no corta antes del límite", async () => {
    hangingFetch();
    const p = fetchWithTimeout("https://odoo.test/x");
    let settled = false;
    p.catch(() => {}).finally(() => (settled = true));
    jest.advanceTimersByTime(DEFAULT_TIMEOUT_MS - 1);
    await Promise.resolve();
    expect(settled).toBe(false);
    jest.advanceTimersByTime(1);
    await expect(p).rejects.toBeInstanceOf(RequestTimeoutError);
  });

  test("respeta un límite personalizado", async () => {
    hangingFetch();
    const p = fetchWithTimeout("https://odoo.test/x", {}, 1000);
    const assertion = expect(p).rejects.toBeInstanceOf(RequestTimeoutError);
    jest.advanceTimersByTime(1000);
    await assertion;
  });

  test("un error de red que no es timeout se propaga sin cambios", async () => {
    const netErr = new TypeError("Network request failed");
    fetchMock.mockRejectedValueOnce(netErr);
    await expect(fetchWithTimeout("https://odoo.test/x")).rejects.toBe(netErr);
    expect(jest.getTimerCount()).toBe(0);
  });
});

describe("servicios de órdenes con timeout", () => {
  test("getOrder rechaza con el mensaje de timeout si Odoo no responde", async () => {
    hangingFetch();
    const p = getOrder(42);
    const assertion = expect(p).rejects.toThrow(TIMEOUT_MESSAGE);
    jest.advanceTimersByTime(DEFAULT_TIMEOUT_MS);
    await assertion;
  });

  test("updateTrip (puede llevar fotos) usa el límite largo de subida", async () => {
    hangingFetch();
    const p = updateTrip(42, {} as any);
    let settled = false;
    p.catch(() => {}).finally(() => (settled = true));

    jest.advanceTimersByTime(DEFAULT_TIMEOUT_MS);
    await Promise.resolve();
    expect(settled).toBe(false);

    jest.advanceTimersByTime(UPLOAD_TIMEOUT_MS - DEFAULT_TIMEOUT_MS);
    await expect(p).rejects.toThrow(TIMEOUT_MESSAGE);
  });
});
