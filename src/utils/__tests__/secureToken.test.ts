import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { getToken, setToken, deleteToken } from "../secureToken";

/**
 * QA-09: el token de sesión se guardaba en AsyncStorage (sin cifrar).
 * Ahora vive en SecureStore y las sesiones existentes se migran sin
 * obligar al chofer a iniciar sesión de nuevo.
 */

const setItemAsyncMock = SecureStore.setItemAsync as jest.Mock;

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("secureToken", () => {
  test("setToken guarda en SecureStore y no en AsyncStorage", async () => {
    await setToken("tok-test");
    expect(await SecureStore.getItemAsync("token")).toBe("tok-test");
    expect(await AsyncStorage.getItem("token")).toBeNull();
  });

  test("setToken usa una accesibilidad sin backup a otro dispositivo", async () => {
    await setToken("tok-test");
    expect(setItemAsyncMock).toHaveBeenCalledWith(
      "token",
      "tok-test",
      expect.objectContaining({
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
      }),
    );
  });

  test("setToken elimina una copia antigua en texto plano", async () => {
    await AsyncStorage.setItem("token", "tok-viejo");
    await setToken("tok-nuevo");
    expect(await AsyncStorage.getItem("token")).toBeNull();
    expect(await getToken()).toBe("tok-nuevo");
  });

  test("getToken devuelve null sin sesión", async () => {
    await expect(getToken()).resolves.toBeNull();
  });

  test("getToken migra un token antiguo de AsyncStorage a SecureStore", async () => {
    await AsyncStorage.setItem("token", "tok-legacy");
    await expect(getToken()).resolves.toBe("tok-legacy");
    expect(await SecureStore.getItemAsync("token")).toBe("tok-legacy");
    expect(await AsyncStorage.getItem("token")).toBeNull();
  });

  test("si SecureStore falla al migrar, conserva la sesión y la copia antigua", async () => {
    await AsyncStorage.setItem("token", "tok-legacy");
    setItemAsyncMock.mockRejectedValueOnce(new Error("Keystore no disponible"));
    await expect(getToken()).resolves.toBe("tok-legacy");
    expect(await AsyncStorage.getItem("token")).toBe("tok-legacy");
  });

  test("prioriza el token de SecureStore sobre uno antiguo", async () => {
    await SecureStore.setItemAsync("token", "tok-seguro");
    await AsyncStorage.setItem("token", "tok-legacy");
    await expect(getToken()).resolves.toBe("tok-seguro");
  });

  test("deleteToken borra el token de ambos almacenes", async () => {
    await SecureStore.setItemAsync("token", "tok-seguro");
    await AsyncStorage.setItem("token", "tok-legacy");
    await deleteToken();
    expect(await SecureStore.getItemAsync("token")).toBeNull();
    expect(await AsyncStorage.getItem("token")).toBeNull();
  });
});
