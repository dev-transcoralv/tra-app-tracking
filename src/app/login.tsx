import {
  View,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import LoginForm from "../components/LoginForm";
import { Stack } from "expo-router";

export default function LoginScreen() {
  return (
    <ImageBackground
      source={require("../../assets/bg-login.png")}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full items-center py-10">
            <View className="w-[90%] max-w-sm md:max-w-md lg:max-w-md p-8 bg-secondary flex-col items-center rounded-[32px] shadow-2xl border border-white/10 mt-10">
              <View className="w-full items-center mb-8">
                <Image
                  source={require("../../assets/logo.png")}
                  style={{ width: "100%", height: 100, maxWidth: 280 }}
                  resizeMode="contain"
                />
              </View>
              <View className="w-full">
                <LoginForm />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}
