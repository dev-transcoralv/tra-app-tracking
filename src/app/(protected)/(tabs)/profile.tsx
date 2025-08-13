import { useContext } from "react";
import { View } from "react-native";
import { AuthContext } from "../../../utils/authContext";
import { Driver } from "../../../shared.types";
import { ProfileForm } from "../../../components/profile/_Form";

export default function Profile() {
  const authContext = useContext(AuthContext);
  const driver: Driver | null = authContext.driver;
  return (
    <View className="bg-secondary h-screen flex p-2">
      <ProfileForm driver={driver} />
    </View>
  );
}
