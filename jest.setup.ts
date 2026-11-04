import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";

// URL fija para que los tests no dependan del .env local
process.env.EXPO_PUBLIC_ODOO_URL = "https://odoo.test";

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn(), hide: jest.fn() },
}));
