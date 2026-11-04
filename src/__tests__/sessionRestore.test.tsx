import { render, screen, waitFor, act } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthProvider } from "../utils/authContext";
import ProtectedLayout from "../app/(protected)/_layout";
import LoginScreen from "../app/login";

/**
 * QA-07: al abrir la app con una sesión guardada, el layout protegido
 * redirigía a /login antes de terminar de leer AsyncStorage, y /login no
 * devolvía al usuario al inicio. El chofer tenía que volver a iniciar sesión
 * en cada arranque en frío.
 */

// Registro de redirecciones: <Redirect href="..."/> deja rastro en `redirects`.
const redirects: string[] = [];
jest.mock("expo-router", () => {
  const { Text: RNText } = jest.requireActual("react-native");
  const Stack = () => <RNText>PROTECTED_CONTENT</RNText>;
  const StackScreen = () => null;
  Stack.Screen = StackScreen;
  return {
    Redirect: ({ href }: { href: string }) => {
      redirects.push(href);
      return null;
    },
    Stack,
    router: { replace: jest.fn() },
  };
});
jest.mock("expo-notifications", () => ({ setNotificationHandler: jest.fn() }));
jest.mock("../utils/notificationContext", () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));
jest.mock("../components/LoginForm", () => {
  const { Text: RNText } = jest.requireActual("react-native");
  return { __esModule: true, default: () => <RNText>LOGIN_FORM</RNText> };
});

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

async function storeSession() {
  await AsyncStorage.setItem("token", "tok-test");
  await AsyncStorage.setItem("driver", JSON.stringify(DRIVER));
}

// El mock oficial de AsyncStorage ya es un jest.fn: se guarda su
// implementación para poder envolverla y restaurarla.
const getItemMock = AsyncStorage.getItem as jest.Mock;
const realGetItem = getItemMock.getMockImplementation()!;

/** Simula una lectura lenta de AsyncStorage (dispositivo de gama baja). */
function slowStorage() {
  const release: (() => void)[] = [];
  getItemMock.mockImplementation(
    (key: string) =>
      new Promise((resolve) => {
        release.push(() => resolve(realGetItem(key)));
      }),
  );
  return async () => {
    // A partir de aquí las lecturas responden normal (token, luego driver).
    getItemMock.mockImplementation(realGetItem);
    await act(async () => {
      while (release.length) release.shift()!();
    });
  };
}

beforeEach(async () => {
  redirects.length = 0;
  getItemMock.mockImplementation(realGetItem);
  await AsyncStorage.clear();
});

afterEach(() => {
  getItemMock.mockImplementation(realGetItem);
});

describe("Arranque con sesión guardada (QA-07)", () => {
  test("el layout protegido no redirige a /login mientras restaura la sesión", async () => {
    await storeSession();
    const releaseStorage = slowStorage();

    await render(
      <AuthProvider>
        <ProtectedLayout />
      </AuthProvider>,
    );
    expect(redirects).not.toContain("/login");

    await releaseStorage();
    await screen.findByText("PROTECTED_CONTENT");
    expect(redirects).not.toContain("/login");
  });

  test("sin sesión guardada, el layout protegido redirige a /login al terminar la carga", async () => {
    await render(
      <AuthProvider>
        <ProtectedLayout />
      </AuthProvider>,
    );
    await waitFor(() => expect(redirects).toContain("/login"));
    expect(screen.queryByText("PROTECTED_CONTENT")).toBeNull();
  });

  test("la pantalla de login redirige al inicio si ya hay sesión guardada", async () => {
    await storeSession();
    await render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>,
    );
    await waitFor(() => expect(redirects).toContain("/"));
  });

  test("la pantalla de login se muestra si no hay sesión", async () => {
    await render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>,
    );
    await screen.findByText("LOGIN_FORM");
    await act(async () => {});
    expect(redirects).not.toContain("/");
  });
});
