import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import Toast from "react-native-toast-message";
import { ObservationModalForm } from "../_ModalForm";
import { createOrUpdateObservation } from "../../../services/odoo/observation";
import {
  RequestTimeoutError,
  TIMEOUT_MESSAGE,
} from "../../../services/odoo/http";

/**
 * QA-11: al fallar el guardado, el formulario mostraba un toast de error
 * vacío (objeto Error), lo tapaba con "Observación editada correctamente"
 * y cerraba el modal perdiendo lo escrito.
 */

jest.mock("../../../services/odoo/observation", () => ({
  createOrUpdateObservation: jest.fn(),
}));
const saveMock = createOrUpdateObservation as jest.Mock;

const ORDER = { id: 42 } as any;
// Datos ficticios de prueba
const OBSERVATION = { id: 7, name: "Llanta baja", order_id: 42 };

async function renderForm() {
  const onClose = jest.fn();
  const onSave = jest.fn();
  await render(
    <ObservationModalForm
      visible
      observation={OBSERVATION}
      order={ORDER}
      onClose={onClose}
      onSave={onSave}
    />,
  );
  return { onClose, onSave };
}

describe("ObservationModalForm: guardado (QA-11)", () => {
  test("al guardar bien muestra éxito, notifica y cierra", async () => {
    saveMock.mockResolvedValueOnce(OBSERVATION);
    const { onClose, onSave } = await renderForm();

    await fireEvent.press(screen.getByText("Guardar Observación"));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(saveMock).toHaveBeenCalledWith(7, "Llanta baja", 42);
    expect(onSave).toHaveBeenCalledWith(OBSERVATION);
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "success",
        text1: "Observación editada correctamente.",
      }),
    );
  });

  test.each([
    ["timeout de red", new RequestTimeoutError(), TIMEOUT_MESSAGE],
    ["error del backend (string)", "Orden cerrada", "Orden cerrada"],
  ])(
    "si falla por %s muestra el motivo, no un éxito, y no cierra el modal",
    async (_n, error, expected) => {
      saveMock.mockRejectedValueOnce(error);
      const { onClose, onSave } = await renderForm();

      await fireEvent.press(screen.getByText("Guardar Observación"));

      await waitFor(() =>
        expect(Toast.show).toHaveBeenCalledWith(
          expect.objectContaining({ type: "error", text1: expected }),
        ),
      );
      expect(Toast.show).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: "success" }),
      );
      expect(onSave).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
      // Lo escrito sigue ahí para reintentar
      expect(screen.getByDisplayValue("Llanta baja")).toBeTruthy();
      // y el botón vuelve a estar disponible
      expect(screen.getByText("Guardar Observación")).toBeTruthy();
    },
  );
});
