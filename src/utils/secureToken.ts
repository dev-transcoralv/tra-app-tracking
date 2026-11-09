/**
 * Almacenamiento del token de sesión en SecureStore (QA-09).
 *
 * Antes el token se guardaba en AsyncStorage, que en Android es una base
 * SQLite sin cifrar y legible desde backups o dispositivos con root.
 * SecureStore usa Keychain (iOS) y Keystore (Android).
 *
 * Las instalaciones existentes tienen el token en AsyncStorage: se migra
 * en la primera lectura para que el chofer no tenga que volver a iniciar
 * sesión al actualizar la app.
 */
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const TOKEN_KEY = "token";
/** Clave donde versiones anteriores de la app dejaban el token. */
export const LEGACY_TOKEN_KEY = "token";

const OPTIONS: SecureStore.SecureStoreOptions = {
  // Disponible tras el primer desbloqueo (la app trabaja en segundo plano
  // con ubicación) y sin viajar a otro dispositivo en un backup.
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token, OPTIONS);
  // Por si quedaba una copia en texto plano de una versión anterior.
  await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
}

export async function getToken(): Promise<string | null> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY, OPTIONS);
  if (token) return token;

  const legacy = await AsyncStorage.getItem(LEGACY_TOKEN_KEY);
  if (!legacy) return null;

  // Se escribe primero en SecureStore y solo después se borra la copia
  // antigua. Si la escritura falla, se conserva la sesión y se reintenta
  // la migración en el próximo arranque.
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, legacy, OPTIONS);
    await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch {
    // Sin migrar todavía; la copia antigua sigue siendo válida.
  }
  return legacy;
}

export async function deleteToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY, OPTIONS);
  await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
}
