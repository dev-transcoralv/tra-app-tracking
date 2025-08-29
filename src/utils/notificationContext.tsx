import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "./registerForPushNotificationsAsync";
import { AuthContext } from "../utils/authContext";
import { Driver } from "../shared.types";
import { updatePushToken } from "../services/odoo/driver";
import { useRouter } from "expo-router";

type NotificationData = {
  order_id: number;
  order_name: string;
};

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const driver: Driver | null = authContext.driver;

  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const registerToken = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          setExpoPushToken(token);
          if (driver?.id) await updatePushToken(driver.id, token);
        }
      } catch (error: any) {
        setError(error);
      }
    };

    registerToken();

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Received notification:", notification);
        setNotification(notification);
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Tapped notification:", response);
        const data = response.notification.request.content
          .data as NotificationData;
        if (data) {
          router.push({
            pathname: `orders/${data.order_id}`,
            params: { reference: data.order_name },
          } as any);
        }
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [router, driver?.id]);

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, notification, error }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
