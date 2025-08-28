import { Redirect, Stack } from "expo-router";
import { AuthContext } from "../../utils/authContext";
import { useContext } from "react";
import { View } from "react-native";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { NotificationProvider } from "../../utils/notificationContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask(
  "BACKGROUND_NOTIFICATION_TASK",
  async ({ data, error, executionInfo }) => {
    if (error) {
      console.error("Task error:", error);
      return;
    }
    if (data) {
      console.log("✅ Received a notification in the background!", {
        data,
        error,
        executionInfo,
      });
      // Do something with the notification data
    }
  },
);

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

export default function ProtectedLayout() {
  const authContext = useContext(AuthContext);
  if (!authContext.isLoggedIn) {
    return <Redirect href="/login" />;
  }
  return (
    <View className="flex-1 bg-black">
      <NotificationProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "black" },
            headerTitle: "",
          }}
        />
      </NotificationProvider>
    </View>
  );
}
