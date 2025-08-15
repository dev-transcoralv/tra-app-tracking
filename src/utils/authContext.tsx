import { router } from "expo-router";
import { createContext, PropsWithChildren, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login } from "../services/odoo/login";
import { ResponseLogin, Driver } from "../shared.types";
import Toast from "react-native-toast-message";
import messaging from "@react-native-firebase/messaging";
import { Alert } from "react-native";

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

  const setupNotifications = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const token = await messaging().getToken();
      console.log("FCM Token:", token);
      // TODO: send token to your backend
    }

    // Listen to foreground messages
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      Alert.alert("Notification", remoteMessage.notification?.body || "");
    });

    return unsubscribe;
  };

  useEffect(() => {
    let unsubscribeMessaging: any;
    const loadDriver = async () => {
      const token = await AsyncStorage.getItem("token");
      const user = await AsyncStorage.getItem("driver");
      if (token && user) {
        setDriver(JSON.parse(user));
        // Setup notifications only when user is logged in
        setupNotifications().then((unsubscribe) => {
          unsubscribeMessaging = unsubscribe;
        });
      }
      setIsLoggedIn(false);
    };
    loadDriver();
    return () => {
      unsubscribeMessaging && unsubscribeMessaging();
    };
  }, []);

  const logIn = async (username: string, password: string) => {
    try {
      const data: ResponseLogin = await login(username, password);
      setIsLoggedIn(true);
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("driver", JSON.stringify(data.employee));
      setDriver(data.employee);
      router.replace("/dashboard");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error,
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
