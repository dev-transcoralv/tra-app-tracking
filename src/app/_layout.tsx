import "../../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../utils/authContext";
import Toast from "react-native-toast-message";
import BannerGlobalWithoutInternet from "../components/BannerGlobalWithoutInternet";

export default function RootLayout() {
  return (
    <AuthProvider>
      <BannerGlobalWithoutInternet />
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
      </Stack>
      <Toast />
    </AuthProvider>
  );
}
