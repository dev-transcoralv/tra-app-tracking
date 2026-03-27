import { View, Image, ImageBackground, useWindowDimensions } from "react-native";
import LoginForm from "../components/LoginForm";
import { useNavigation } from "expo-router";
import { useEffect } from "react";

export default function LoginScreen() {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <ImageBackground
      source={require("../../assets/bg-login.jpeg")}
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
