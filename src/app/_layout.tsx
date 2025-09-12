import "../../global.css";
import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../utils/authContext";
import Toast, { ErrorToast } from "react-native-toast-message";
import BannerGlobalWithoutInternet from "../components/BannerGlobalWithoutInternet";

export default function RootLayout() {
  const toastConfig = {
    error: (props: any) => (
      <ErrorToast
        {...props}
        style={[styles.toastBase, { backgroundColor: "#e10718" }]}
        text1Style={[styles.text, { color: "#fff", fontWeight: "bold" }]}
      />
    ),
  };
  return (
    <AuthProvider>
      <BannerGlobalWithoutInternet />
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
      </Stack>
      <Toast config={toastConfig} />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  toastBase: {
    borderLeftWidth: 0,
    borderRadius: 12,
    minHeight: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 12,
  },
});
