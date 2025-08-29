import { Redirect, Stack } from "expo-router";
import { AuthContext } from "../../utils/authContext";
import { useContext } from "react";
import { View } from "react-native";
import * as Notifications from "expo-notifications";
import { NotificationProvider } from "../../utils/notificationContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
