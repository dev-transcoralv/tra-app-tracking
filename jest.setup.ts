import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";

// URL fija para que los tests no dependan del .env local
process.env.EXPO_PUBLIC_ODOO_URL = "https://odoo.test";

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn(), hide: jest.fn() },
}));

// SecureStore en memoria (el módulo nativo no existe en Jest).
jest.mock("expo-secure-store", () => {
  const store = new Map<string, string>();
  return {
    __esModule: true,
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 0,
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
    __reset: () => store.clear(),
  };
});

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("expo-secure-store").__reset();
});
