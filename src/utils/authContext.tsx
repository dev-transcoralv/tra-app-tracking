import { router } from "expo-router";
import { createContext, PropsWithChildren, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login } from "../services/odoo/login";
import { ResponseLogin, Driver } from "../shared.types";
import Toast from "react-native-toast-message";

type AuthState = {
  driver: Driver | null;
  /** true mientras se restaura la sesión guardada en AsyncStorage (QA-07). */
  isLoading: boolean;
  isLoggedIn: boolean;
  logIn: (username: string, password: string) => void;
  logOut: () => void;
};

export const AuthContext = createContext<AuthState>({
  driver: null,
  isLoading: true,
  isLoggedIn: false,
  logIn: (username: string, password: string) => {},
  logOut: () => {},
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDriver = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const user = await AsyncStorage.getItem("driver");
        if (token && user) {
          setDriver(JSON.parse(user));
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        // Storage ilegible o driver corrupto: se trata como sin sesión.
        setDriver(null);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    loadDriver();
  }, []);

  const logIn = async (username: string, password: string) => {
    try {
      const data: ResponseLogin = await login(username, password);
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("driver", JSON.stringify(data.employee));
      // driver antes que isLoggedIn: las pantallas protegidas usan driver.id
      setDriver(data.employee);
      setIsLoggedIn(true);
      router.replace("/");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error?.message || String(error),
      });
      throw error;
    }
  };

  const logOut = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("driver");
    await AsyncStorage.removeItem("orderIdStarted");
    setDriver(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{ driver, isLoading, isLoggedIn, logIn, logOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
