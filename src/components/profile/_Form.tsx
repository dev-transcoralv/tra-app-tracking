import { Text, View, Button } from "react-native";
import { Driver } from "../../shared.types";
import { useContext } from "react";
import { AuthContext } from "../../utils/authContext";

export function ProfileForm({ driver }: { driver: Driver | null }) {
  const authContext = useContext(AuthContext);

  return (
    <View className="w-full flex gap-1 bg-secondary-complementary p-2 rounded-xl">
      <Text className="font-bold">Nombre:</Text>
      <Text className="p-2 bg-white rounded-xl">{driver?.name}</Text>

      <Text className="font-bold">Cédula:</Text>
      <Text className="p-2 bg-white rounded-xl">{driver?.vat}</Text>

      <Text className="font-bold">Dirección:</Text>
      <Text className="p-2 bg-white rounded-xl">{driver?.street}</Text>

      <Text className="font-bold">Tipo de Licencia:</Text>
      <Text className="mb-2 p-2 bg-white rounded-xl">
        {driver?.license_type}
      </Text>

      <Button
        color="red"
        onPress={() => authContext.logOut()}
        title="Cerrar Sesión"
      />
    </View>
  );
}
