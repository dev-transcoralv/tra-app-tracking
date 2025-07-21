import { Redirect, Stack } from "expo-router";
import { AuthContext } from "../../utils/authContext";
import { useContext } from "react";
import { View } from "react-native";

export default function ProtectedLayout() {
  const authContext = useContext(AuthContext);
  if (!authContext.isLoggedIn) {
    return <Redirect href="/login" />;
  }
  return (
    <View className="flex-1 bg-black">
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "black" },
          headerTitle: "",
        }}
      />
    </View>
  );
}
