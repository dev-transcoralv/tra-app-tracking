import { router } from "expo-router";
import { createContext, PropsWithChildren, useState } from "react";
import { odooLogin } from "../services/odoo/login";
import { Driver } from "../shared.types";

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

  const logIn = async (username: string, password: string) => {
    const data = await odooLogin(username, password);
    console.log(data);
    setIsLoggedIn(true);
    router.replace("/");
  };

  const logOut = () => {
    setIsLoggedIn(false);
    setDriver(null);
  };

  return (
    <AuthContext.Provider value={{ driver, isLoggedIn, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}
