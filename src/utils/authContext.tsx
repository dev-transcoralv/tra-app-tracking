import { router } from "expo-router";
import { createContext, PropsWithChildren, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { odooLogin } from "../services/odoo/login";
import { ResponseLogin, Driver } from "../shared.types";
import Toast from "react-native-toast-message";

type AuthState = {
  driver: Driver | null;
  isLoggedIn: boolean;
  logIn: (username: string, password: string) => void;
  logOut: () => void;
};

export const AuthContext = createContext<AuthState>({
  driver: null,
  isLoggedIn: false,
  logIn: (username: string, password: string) => {},
  logOut: () => {},
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loadDriver = async () => {
      const token = await AsyncStorage.getItem("token");
      const user = await AsyncStorage.getItem("driver");
      if (token && user) {
        setDriver(JSON.parse(user));
      }
      setIsLoggedIn(false);
    };
    loadDriver();
  }, []);

  const logIn = async (username: string, password: string) => {
    try {
      const data: ResponseLogin = await odooLogin(username, password);
      console.log("Sucess Login");
      setIsLoggedIn(true);
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("driver", JSON.stringify(data.employee));
      setDriver(data.employee);
      router.replace("/orders");
    } catch (error: any) {
      console.log("Error Login");
      Toast.show({
        type: "error",
        text1: "Ocurrió un error inesperado",
      });
      throw error;
    }
  };

  const logOut = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("driver");
    setDriver(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ driver, isLoggedIn, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}
