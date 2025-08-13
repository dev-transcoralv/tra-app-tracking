import { Text, View, TextInput, Button } from "react-native";
import { Driver } from "../../shared.types";
import { useContext } from "react";
import { AuthContext } from "../../utils/authContext";

export function ProfileForm({ driver }: { driver: Driver | null }) {
  const authContext = useContext(AuthContext);
  return (
    <View className="w-full flex gap-1 bg-secondary-complementary p-2 rounded-xl">
      <Text className="font-bold">Nombre:</Text>
      <TextInput readOnly value={driver?.name} />
      <Text className="font-bold">Cédula:</Text>
      <TextInput readOnly value={driver?.vat} />
      <Text className="font-bold">Dirección:</Text>
      <TextInput readOnly value={driver?.street} />
      <Text className="font-bold">Tipo de Licencia:</Text>
      <TextInput readOnly value={driver?.license_type} />
      <Button
        color="red"
        onPress={() => authContext.logOut()}
        title="Cerrar Sesión"
      />
    </View>
  );
}
