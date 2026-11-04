import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react-native";
import { OrderForm } from "../_Form";
import {
  startTrip,
  stopTrip,
  tripFinished,
  updateTrip,
} from "../../../services/odoo/order";
import type { Order } from "../../../shared.types";

/**
 * QA-06: los botones de viaje no se bloquean mientras la petición está en
 * curso. Un doble tap enviaba dos PUT al backend de Odoo.
 */

jest.mock("../../../services/odoo/order", () => ({
  getListReasonFakeFreight: jest.fn().mockResolvedValue({ results: [] }),
  getListReasonReturn: jest.fn().mockResolvedValue({ results: [] }),
  getOrder: jest.fn(),
  startTrip: jest.fn(),
  stopTrip: jest.fn(),
  tripFinished: jest.fn(),
  updateTrip: jest.fn(),
}));
jest.mock("../../../services/odoo/vehicle", () => ({
  getListChassis: jest.fn().mockResolvedValue({ results: [] }),
}));
jest.mock("../../../services/odoo/guide", () => ({
  createOrUpdateGuide: jest.fn(),
}));

// Componentes hijos pesados (mapas, cámara, listas con su propia red)
jest.mock("../../guides/_List", () => ({ ListGuides: () => null }));
jest.mock("../../observations/_List", () => ({ ListObservations: () => null }));
jest.mock("../../moves/_List", () => ({ ListMoves: () => null }));
jest.mock("../../WhatsappButton", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("../../WialonLiveMap", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("../../RouteMapView", () => ({ RouteMapView: () => null }));
jest.mock("../../ImagePickerField", () => ({ ImagePickerField: () => null }));
jest.mock("../_DatetimeButton", () => ({ DatetimeButton: () => null }));
jest.mock("../_DatetimeButtonWialon", () => ({
  DatetimeButtonWialon: () => null,
}));
jest.mock("react-native-element-dropdown", () => ({ Dropdown: () => null }));
jest.mock("@react-native-picker/picker", () => {
  const Picker = () => null;
  const PickerItem = () => null;
  Picker.Item = PickerItem;
  return { Picker };
});

const startTripMock = startTrip as jest.MockedFunction<typeof startTrip>;
const stopTripMock = stopTrip as jest.MockedFunction<typeof stopTrip>;
const tripFinishedMock = tripFinished as jest.MockedFunction<
  typeof tripFinished
>;
const updateTripMock = updateTrip as jest.MockedFunction<typeof updateTrip>;

/** Promesa controlable: simula una petición lenta que sigue en curso. */
const openDeferreds: ((v: any) => void)[] = [];
function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  openDeferreds.push(resolve);
  return { promise, resolve };
}

// Datos ficticios de prueba (sin PII real)
function buildOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 42,
    name: "OT-QA-042",
    trip_status: null,
    business_name: "Paletizado",
    business_code: "palletizing",
    type_delivery_note: "own",
    status_arrival: "done",
    coordinator_name: "Coordinador QA",
    coordinator_mobile: null,
    route_name: "Ruta QA",
    route_2_name: null,
    vehicle_name: "QA-0000",
    type_property: "own",
    not_need_chassis: true,
    chassis: null,
    driver_assistant_name: null,
    return_date_bottle: null,
    route_geolocation_origin: { latitude: -2.1, longitude: -79.9 },
    route_geolocation_destination: { latitude: -2.2, longitude: -79.8 },
    partner_name: "Cliente QA",
    eta_charge: "2026-11-04 08:00:00",
    eta_download: "2026-11-04 12:00:00",
    arrival_point_charge_time: null,
    arrival_charge_time: null,
    departure_charge_time: null,
    departure_point_charge_time: null,
    arrival_point_download_time: null,
    arrival_download_time: null,
    departure_download_time: null,
    departure_point_download_time: null,
    start_of_trip: null,
    start_of_trip_iso_format: null,
    guides: [],
    observations: [],
    moves: [],
    goes_to_position_retirement: false,
    container_workflow: null,
    container_type_operation: null,
    container_type_operation_value: null,
    container_type: null,
    container_type_value: null,
    port_name: "",
    kind_container_name: "",
    retreat_yard_name: null,
    chassis_type: "",
    turn_date: null,
    arrival_empty_time: null,
    departure_empty_time: null,
    image_container: null,
    has_generator: false,
    generator_supplier_name: null,
    generator_supplier_removal: null,
    generator_supplier_delivery: null,
    container: null,
    information: null,
    operation_name: "",
    material_name: "",
    burden_kg: 0,
    tara_kg: 0,
    final_burden_kg: 0,
    final_tara_kg: 0,
    image_scale_ticket: null,
    final_image_scale_ticket: null,
    sacks_information: null,
    fake_freight: false,
    reason_fake_freight: { id: 0, name: "" },
    has_adjustment_tm: false,
    adjustment_sacks: 0,
    consolidated_trip: false,
    is_return: false,
    reason_return: { id: 0, name: "" },
    type_return_burden_sacks: null,
    return_burden_sacks: 0,
    consolidated_delivery: false,
    cylinder_delivered: false,
    ...overrides,
  } as Order;
}

const TOGGLE = "btn-toggle-trip";
const SAVE = "btn-save-order";
const FINISH = "btn-finish-trip";

/**
 * RNTL v14 hace que `fireEvent.press` espere la promesa que devuelve onPress.
 * Para simular un tap mientras la petición sigue pendiente, no se espera el
 * tap: se dispara y luego se drena la cola de React con `flush()`.
 */
const pressNoWait = async (element: Parameters<typeof fireEvent.press>[0]) => {
  void fireEvent.press(element);
  // Un macrotask deja terminar el act() interno de fireEvent sin esperar
  // la promesa del handler (que sigue pendiente a propósito).
  await new Promise((r) => setTimeout(r, 0));
};
const tap = (testID: string) => pressNoWait(screen.getByTestId(testID));
const flush = () => act(async () => {});

describe("OrderForm: protección contra doble tap (QA-06)", () => {
  beforeEach(() => {
    // Llamadas extra (el defecto) devuelven una orden válida en vez de
    // undefined, para que el fallo sea el conteo y no un crash del render.
    for (const m of [
      startTripMock,
      stopTripMock,
      tripFinishedMock,
      updateTripMock,
    ]) {
      m.mockReset();
      m.mockResolvedValue(buildOrder({ trip_status: "initiated" }));
    }
  });

  afterEach(async () => {
    // Si un test falla a mitad, no dejar peticiones colgadas que contaminen
    // el act() de los siguientes tests.
    await act(async () => {
      openDeferreds.splice(0).forEach((resolve) => resolve(buildOrder()));
    });
  });

  test("iniciar viaje: el segundo tap mientras carga no llama otra vez a startTrip", async () => {
    const pending = deferred<Order>();
    startTripMock.mockReturnValueOnce(pending.promise);
    await render(<OrderForm order={buildOrder()} />);

    await tap(TOGGLE);
    await flush();
    await tap(TOGGLE);
    await flush();

    expect(startTripMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId(TOGGLE)).toBeDisabled();
    await act(async () =>
      pending.resolve(buildOrder({ trip_status: "initiated" })),
    );
    await screen.findByText("DETENER EL VIAJE");
    expect(screen.getByTestId(TOGGLE)).toBeEnabled();
  });

  test("detener viaje: el segundo tap mientras carga no llama otra vez a stopTrip", async () => {
    const pending = deferred<Order>();
    stopTripMock.mockReturnValueOnce(pending.promise);
    await render(
      <OrderForm order={buildOrder({ trip_status: "initiated" })} />,
    );

    await tap(TOGGLE);
    await flush();
    await tap(TOGGLE);
    await flush();

    expect(stopTripMock).toHaveBeenCalledTimes(1);
    await act(async () => pending.resolve(buildOrder({ trip_status: null })));
    await screen.findByText("INICIAR EL VIAJE");
  });

  test("iniciar viaje: si la petición falla, el botón se re-habilita y permite reintentar", async () => {
    startTripMock.mockRejectedValueOnce("Error interno");
    startTripMock.mockResolvedValueOnce(
      buildOrder({ trip_status: "initiated" }),
    );
    await render(<OrderForm order={buildOrder()} />);

    await tap(TOGGLE);
    await flush();
    expect(screen.getByTestId(TOGGLE)).toBeEnabled();
    await tap(TOGGLE);
    await flush();

    expect(startTripMock).toHaveBeenCalledTimes(2);
    await screen.findByText("DETENER EL VIAJE");
  });

  test("guardar cambios: el segundo tap mientras carga no llama otra vez a updateTrip", async () => {
    const pending = deferred<Order>();
    updateTripMock.mockReturnValueOnce(pending.promise);
    await render(
      <OrderForm order={buildOrder({ trip_status: "initiated" })} />,
    );

    await tap(SAVE);
    await waitFor(() => expect(updateTripMock).toHaveBeenCalledTimes(1));
    await tap(SAVE);
    await flush();

    expect(updateTripMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId(SAVE)).toBeDisabled();
    await act(async () =>
      pending.resolve(buildOrder({ trip_status: "initiated" })),
    );
    await waitFor(() => expect(screen.getByTestId(SAVE)).toBeEnabled());
  });

  test("finalizar viaje: confirmar otra vez mientras carga no llama otra vez a tripFinished", async () => {
    const pending = deferred<Order>();
    tripFinishedMock.mockReturnValueOnce(pending.promise);
    // fake_freight omite la validación de campos obligatorios del cierre
    const order = buildOrder({ trip_status: "initiated", fake_freight: true });
    await render(<OrderForm order={order} />);

    await fireEvent.press(screen.getByTestId(FINISH));
    await pressNoWait(await screen.findByText("Confirmar"));
    await waitFor(() => expect(tripFinishedMock).toHaveBeenCalledTimes(1));

    // Segundo intento mientras la primera petición sigue en curso
    await tap(FINISH);
    await flush();
    const confirmAgain = screen.queryByText("Confirmar");
    if (confirmAgain) await pressNoWait(confirmAgain);
    await flush();

    expect(tripFinishedMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId(FINISH)).toBeDisabled();
    await act(async () =>
      pending.resolve(
        buildOrder({ trip_status: "finished", fake_freight: true }),
      ),
    );
  });
});
