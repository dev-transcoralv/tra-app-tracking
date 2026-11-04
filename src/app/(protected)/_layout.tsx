import { Redirect, Stack } from "expo-router";
import { AuthContext } from "../../utils/authContext";
import { useContext } from "react";
import { ActivityIndicator, View } from "react-native";
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
  // Esperar a que termine la restauración de la sesión antes de decidir:
  // redirigir antes forzaba un login en cada arranque en frío (QA-07).
  if (authContext.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (!authContext.isLoggedIn) {
    return <Redirect href="/login" />;
  }
  return (
    <View className="flex-1 bg-black">
      <NotificationProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
            contentStyle: { backgroundColor: "#fff" },
          }}
        />
      </NotificationProvider>
    </View>
  );
}
