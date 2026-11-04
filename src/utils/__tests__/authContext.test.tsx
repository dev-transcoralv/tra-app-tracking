import { useContext } from "react";
import { Text, Pressable } from "react-native";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import { AuthContext, AuthProvider } from "../authContext";
import { login } from "../../services/odoo/login";

jest.mock("../../services/odoo/login", () => ({ login: jest.fn() }));
jest.mock("expo-router", () => ({ router: { replace: jest.fn() } }));

const loginMock = login as jest.MockedFunction<typeof login>;

// Datos ficticios de prueba (sin PII real)
const DRIVER = {
  id: 7,
  name: "Chofer QA",
  vat: "0000000000",
  street: "N/A",
  license_type: "E",
  expiration_date: "2030-01-01",
  image_1920: null,
  port_permit: [],
  assigned_plate: null,
  assigned_plate_port_permit: [],
  push_token: null,
};

function Probe() {
  const { isLoggedIn, driver, logIn, logOut } = useContext(AuthContext);
  return (
    <>
      <Text testID="status">{isLoggedIn ? "in" : "out"}</Text>
      <Text testID="driver">{driver?.name ?? "-"}</Text>
      <Pressable
        testID="login"
        onPress={() =>
          (logIn("qa@example.com", "pass") as any)?.catch?.(() => {})
        }
      />
      <Pressable testID="logout" onPress={() => logOut()} />
    </>
  );
}

const renderAuth = async () =>
  await render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("AuthProvider", () => {
  test("sin sesión guardada queda deslogueado", async () => {
    await renderAuth();
    await waitFor(() =>
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("driver"),
    );
    expect(screen.getByTestId("status")).toHaveTextContent("out");
  });

  test("restaura la sesión guardada en storage", async () => {
    await AsyncStorage.setItem("token", "tok-test");
    await AsyncStorage.setItem("driver", JSON.stringify(DRIVER));
    await renderAuth();
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("in"),
    );
    expect(screen.getByTestId("driver")).toHaveTextContent("Chofer QA");
  });

  test("con token pero sin driver no restaura la sesión", async () => {
    await AsyncStorage.setItem("token", "tok-test");
    await renderAuth();
    await waitFor(() =>
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("driver"),
    );
    expect(screen.getByTestId("status")).toHaveTextContent("out");
  });

  test("logIn exitoso persiste token y driver y navega a /", async () => {
    loginMock.mockResolvedValueOnce({
      token: "tok-test",
      employee: DRIVER,
    } as any);
    await renderAuth();
    await fireEvent.press(screen.getByTestId("login"));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/"));
    expect(loginMock).toHaveBeenCalledWith("qa@example.com", "pass");
    expect(await AsyncStorage.getItem("token")).toBe("tok-test");
    expect(JSON.parse((await AsyncStorage.getItem("driver"))!)).toEqual(DRIVER);
    expect(screen.getByTestId("status")).toHaveTextContent("in");
  });

  test("logIn fallido muestra toast, no persiste nada y no navega", async () => {
    loginMock.mockRejectedValueOnce(new Error("Credenciales inválidas"));
    await renderAuth();
    await fireEvent.press(screen.getByTestId("login"));
    await waitFor(() =>
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          text1: "Credenciales inválidas",
        }),
      ),
    );
    expect(await AsyncStorage.getItem("token")).toBeNull();
    expect(router.replace).not.toHaveBeenCalled();
    expect(screen.getByTestId("status")).toHaveTextContent("out");
  });

  test("logOut borra token, driver y orderIdStarted", async () => {
    await AsyncStorage.multiSet([
      ["token", "tok-test"],
      ["driver", JSON.stringify(DRIVER)],
      ["orderIdStarted", "42"],
    ]);
    await renderAuth();
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("in"),
    );
    await fireEvent.press(screen.getByTestId("logout"));
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("out"),
    );
    expect(
      await AsyncStorage.multiGet(["token", "driver", "orderIdStarted"]),
    ).toEqual([
      ["token", null],
      ["driver", null],
      ["orderIdStarted", null],
    ]);
  });

  // DEFECTO QA-07: isLoggedIn arranca en false mientras se lee AsyncStorage.
  // El layout protegido redirige a /login en ese primer render, aunque haya
  // una sesión válida guardada. No existe un estado "cargando".
  test.failing(
    "QA-07 con sesión guardada nunca debe reportar isLoggedIn=false durante la restauración",
    async () => {
      await AsyncStorage.setItem("token", "tok-test");
      await AsyncStorage.setItem("driver", JSON.stringify(DRIVER));
      const seen: boolean[] = [];
      function Recorder() {
        seen.push(useContext(AuthContext).isLoggedIn);
        return null;
      }
      await render(
        <AuthProvider>
          <Recorder />
        </AuthProvider>,
      );
      await waitFor(() => expect(seen).toContain(true));
      expect(seen).not.toContain(false);
    },
  );
});
