import { useContext } from "react";
import { View, Button } from "react-native";
import { AuthContext } from "../../../utils/authContext";
import { Driver } from "../../../shared.types";
import { ProfileForm } from "../../../components/profile/_Form";

export default function Profile() {
  const authContext = useContext(AuthContext);
  const driver: Driver | null = authContext.driver;
  return (
    <View>
      <ProfileForm driver={driver} />
      <Button
        color="red"
        onPress={() => authContext.logOut()}
        title="Cerrar Sesión"
      />
    </View>
  );
}
