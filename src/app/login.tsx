import { View, Text } from "react-native";
import LoginForm from "../components/LoginForm";

export default function LoginScreen() {
  return (
    <View className="w-full h-screen flex items-center justify-center">
      <View className="w-[90%] max-w-sm md:max-w-md lg:max-w-md p-5 bg-gray-900 flex-col flex items-center gap-3 rounded-xl shadow-slate-500 shadow-lg">
        <Text className="text-lg md:text-xl font-semibold text-white">
          Transcoralv
        </Text>
        <LoginForm />
      </View>
    </View>
  );
}
