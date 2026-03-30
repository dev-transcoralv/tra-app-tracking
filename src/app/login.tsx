import { 
  View, 
  Image, 
  ImageBackground, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from "react-native";
import LoginForm from "../components/LoginForm";
import { Stack } from "expo-router";

export default function LoginScreen() {
  return (
    <ImageBackground
      source={require("../../assets/bg-login.jpeg")}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full items-center py-10">
            <View className="w-[90%] max-w-sm md:max-w-md lg:max-w-md p-6 bg-secondary flex-col items-center gap-4 rounded-xl shadow-slate-500 shadow-lg">
              <Image
                source={require("../../assets/logo.png")}
                style={{ width: "100%", height: 100, maxWidth: 300 }}
                resizeMode="contain"
              />
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
