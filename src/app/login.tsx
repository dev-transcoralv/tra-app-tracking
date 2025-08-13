import { Dimensions, View, Image, ImageBackground } from "react-native";
import LoginForm from "../components/LoginForm";
import { useNavigation } from "expo-router";
import { useEffect } from "react";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  });

  return (
    <ImageBackground
      source={require("../../assets/bg-login.jpg")}
      resizeMode="cover"
      style={{ width, height }}
    >
      <View className="w-full h-screen flex items-center justify-center">
        <View className="w-[90%] max-w-sm md:max-w-md lg:max-w-md p-5 bg-secondary flex-col flex items-center gap-3 rounded-xl shadow-slate-500 shadow-lg">
          <Image
            source={require("../../assets/logo.png")}
            style={{ width: 300 }}
            resizeMode="contain"
          />
          <LoginForm />
        </View>
      </View>
    </ImageBackground>
  );
}
