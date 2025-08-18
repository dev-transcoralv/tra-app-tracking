import { useState, useEffect, useRef } from "react";
import { Platform, Alert } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "../utils/authContext"; // adjust path
import { updatePushToken } from "../services/odoo/driver";

type NotificationData = {
  order_id: number;
  order_name: string;
};

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

async function registerForPushNotificationsAsync() {
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
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

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

export function useExpoPushNotifications() {
  const router = useRouter();
  const [expoPushToken, setExpoPushToken] = useState<string>("");
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const { driver } = useContext(AuthContext);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    const registerAndSaveToken = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          setExpoPushToken(token);
          if (driver?.id) {
            await updatePushToken(driver.id, token);
          }
        }
      } catch (error) {
        console.error("Push registration error:", error);
      }
    };

    registerAndSaveToken();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification tapped:", response);
        const data = response.notification.request.content
          .data as NotificationData;
        router.push(`/orders/${data.order_id}`);
        router.push({
          pathname: `orders/${data.order_id}`,
          params: { reference: data.order_name },
        });
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [router, driver?.id]);

  return { expoPushToken, notification };
}
