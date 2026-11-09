import { Alert, AlertButton } from "react-native";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import Toast from "react-native-toast-message";
import { ListMoves } from "../moves/_List";
import { ListGuides } from "../guides/_List";
import { ListObservations } from "../observations/_List";
import { deleteMove } from "../../services/odoo/move";
import { deleteGuide } from "../../services/odoo/guide";
import { deleteObservation } from "../../services/odoo/observation";

/**
 * QA-10: el ícono de papelera borraba en Odoo al primer toque, sin
 * confirmación. Además, en movimientos y observaciones el toast de éxito
 * estaba en `finally` y tapaba el de error: un borrado fallido se
 * mostraba como "eliminado correctamente".
 */

jest.mock("../../services/odoo/move", () => ({ deleteMove: jest.fn() }));
jest.mock("../../services/odoo/guide", () => ({
  deleteGuide: jest.fn(),
  printGuide: jest.fn(),
}));
jest.mock("../../services/odoo/observation", () => ({
  deleteObservation: jest.fn(),
}));
// Los formularios modales no participan en el borrado.
jest.mock("../moves/_ModalForm", () => ({ MoveModalForm: () => null }));
jest.mock("../guides/_ModalForm", () => ({ GuideModalForm: () => null }));
jest.mock("../observations/_ModalForm", () => ({
  ObservationModalForm: () => null,
}));
jest.mock("expo-file-system", () => ({}));
jest.mock("expo-sharing", () => ({}));

const ORDER = { id: 42 } as any;

// Datos ficticios de prueba
const CASES = [
  {
    name: "movimiento",
    service: deleteMove as jest.Mock,
    item: {
      id: 7,
      order_id: 42,
      origin: { id: 1, name: "Origen" },
      destination: { id: 2, name: "Destino" },
      geocerca: { id: 1, name: "Patio A" },
      geocerca_destination: { id: 2, name: "Puerto B" },
      date_in: "2026-01-01 08:00",
      date_out: "2026-01-01 10:00",
    },
    renderList: (items: any[], onUpdate: jest.Mock) => (
      <ListMoves
        order={ORDER}
        moves={items}
        onUpdate={onUpdate}
        orderFinished={false}
      />
    ),
    okText: "Movimiento eliminado correctamente.",
  },
  {
    name: "guía",
    service: deleteGuide as jest.Mock,
    item: { id: 7, name: "GR-001", type: "own", picking_id: null },
    renderList: (items: any[], onUpdate: jest.Mock) => (
      <ListGuides
        order={ORDER}
        guides={items}
        onUpdate={onUpdate}
        orderFinished={false}
      />
    ),
    okText: "Guía eliminada correctamente.",
  },
  {
    name: "observación",
    service: deleteObservation as jest.Mock,
    item: { id: 7, name: "Llanta baja", order_id: 42 },
    renderList: (items: any[], onUpdate: jest.Mock) => (
      <ListObservations
        order={ORDER}
        observations={items}
        onUpdate={onUpdate}
        orderFinished={false}
      />
    ),
    okText: "Observación eliminada correctamente.",
  },
];

/** Simula que el usuario pulsa el botón `label` del Alert. */
function answerAlertWith(label: "Cancelar" | "Eliminar") {
  return jest
    .spyOn(Alert, "alert")
    .mockImplementation((_t, _m, buttons?: AlertButton[]) => {
      buttons?.find((b) => b.text === label)?.onPress?.();
    });
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe.each(CASES)("Borrar $name (QA-10)", (c) => {
  test("pide confirmación y no borra si el usuario cancela", async () => {
    const alertSpy = answerAlertWith("Cancelar");
    const onUpdate = jest.fn();
    await render(c.renderList([c.item], onUpdate));

    await fireEvent.press(screen.getByTestId("btn-delete-7"));

    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(alertSpy.mock.calls[0][1]).toContain("no se puede deshacer");
    expect(c.service).not.toHaveBeenCalled();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  test("al confirmar borra, actualiza la lista y muestra éxito", async () => {
    answerAlertWith("Eliminar");
    c.service.mockResolvedValueOnce("ok");
    const onUpdate = jest.fn();
    await render(c.renderList([c.item], onUpdate));

    await fireEvent.press(screen.getByTestId("btn-delete-7"));

    await waitFor(() => expect(onUpdate).toHaveBeenCalledWith([]));
    expect(c.service).toHaveBeenCalledWith(7);
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success", text1: c.okText }),
    );
  });

  test("si el backend falla muestra el error y no un falso éxito", async () => {
    answerAlertWith("Eliminar");
    c.service.mockRejectedValueOnce(new Error("Sin conexión"));
    const onUpdate = jest.fn();
    await render(c.renderList([c.item], onUpdate));

    await fireEvent.press(screen.getByTestId("btn-delete-7"));

    await waitFor(() =>
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error", text1: "Sin conexión" }),
      ),
    );
    expect(Toast.show).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: "success" }),
    );
    expect(onUpdate).not.toHaveBeenCalled();
  });
});
