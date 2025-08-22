import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Platform, Alert } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import type { Notification } from "expo-notifications";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { AuthContext } from "./authContext"; // adjust path
import { updatePushToken } from "../services/odoo/driver";

// -------------------
// Types
// -------------------
type NotificationData = {
  order_id: number;
  order_name: string;
};

type NotificationContextType = {
  expoPushToken: string;
  notification: Notification | null;
};

// -------------------
// Context
// -------------------
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

// -------------------
// Handlers
// -------------------
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function handleRegistrationError(errorMessage: string) {
  Alert.alert("Notification Error", errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync(): Promise<
  string | undefined
> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (!Device.isDevice) {
    handleRegistrationError("Must use physical device for push notifications");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    handleRegistrationError("Permission not granted for push notifications!");
    return;
  }

  const projectId =
    (Constants?.expoConfig as any)?.extra?.eas?.projectId ??
    (Constants?.easConfig as any)?.projectId;

  if (!projectId) {
    handleRegistrationError("Project ID not found in Constants");
    return;
  }

  try {
    const pushTokenString = (
      await Notifications.getExpoPushTokenAsync({ projectId })
    ).data;
    return pushTokenString;
  } catch (e) {
    handleRegistrationError(String(e));
  }
}

// -------------------
// Provider
// -------------------
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [expoPushToken, setExpoPushToken] = useState<string>("");
  const [notification, setNotification] = useState<Notification | null>(null);
  const { driver } = useContext(AuthContext);

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    const registerAndSaveToken = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          setExpoPushToken(token);

          // 🔑 Save token in Odoo when authenticated
          if (driver?.id) {
            await updatePushToken(driver.id, token);
          }
        }
      } catch (error) {
        console.error("Push registration error:", error);
      }
    };

    registerAndSaveToken();

    // Listener when a notification arrives
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    // Listener when user taps a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification tapped:", response);
        const data = response.notification.request.content
          .data as NotificationData;

        // Navigate to order screen
        router.push({
          pathname: `orders/${data.order_id}`,
          params: { reference: data.order_name },
        } as any);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [router, driver?.id]);

  return (
    <NotificationContext.Provider value={{ expoPushToken, notification }}>
      {children}
    </NotificationContext.Provider>
  );
};

// -------------------
// Hook
// -------------------
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}
