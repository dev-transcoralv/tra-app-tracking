import { useContext } from "react";
import { View, Button } from "react-native";
import { AuthContext } from "../../../utils/authContext";
import { ProfileForm } from "../../../components/profile/_Form";
import { Driver } from "../../../shared.types";

export default function Profile() {
  const authContext = useContext(AuthContext);
  const driver: Driver | null = authContext.driver;
  console.log(driver);
  return (
    <View>
      {/*<ProfileForm props={{ driver: driver }} />*/}
      <Button
        color="red"
        onPress={() => authContext.logOut()}
        title="Cerrar Sesión"
      />
    </View>
  );
}
