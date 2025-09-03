import { Text, View, Button } from "react-native";
import { Driver } from "../../shared.types";
import { useContext } from "react";
import { AuthContext } from "../../utils/authContext";
import Avatar from "./_Avatar";

export function ProfileForm({ driver }: { driver: Driver | null }) {
  const authContext = useContext(AuthContext);

  return (
    <View className="w-full flex gap-1 bg-secondary-complementary p-2 rounded-xl">
      <Avatar uri={driver?.image_1920} size={128} />
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
      <Text className="font-bold">Fecha de Vigencia de Licencia:</Text>
      <Text className="mb-2 p-2 bg-white rounded-xl">
        {driver?.expiration_date}
      </Text>
      {driver?.port_permit && (
        <View>
          <Text className="font-extrabold text-lg color-blue-900 underline mb-2">
            Puertos Permitidos
          </Text>
          {driver.port_permit.map((port) => (
            <View key={port.id} className="bg-white border rounded-xl p-2 mb-2">
              <View className="flex-row">
                <Text className="text-lg font-bold">{port.name}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {driver?.assigned_plate && (
        <View>
          <Text className="font-bold">Placa Asignada:</Text>
          <Text className="mb-2 p-2 bg-white rounded-xl">
            {driver.assigned_plate}
          </Text>
        </View>
      )}
      {driver?.assigned_plate_port_permit && (
        <View>
          <Text className="font-extrabold text-lg color-blue-900 underline mb-2">
            Puertos Permitidos
          </Text>
          {driver.assigned_plate_port_permit.map((port) => (
            <View key={port.id} className="bg-white border rounded-xl p-2 mb-2">
              <View className="flex-row">
                <Text className="text-lg font-bold">{port.name}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <Button
        color="red"
        onPress={() => authContext.logOut()}
        title="Cerrar Sesión"
      />
    </View>
  );
}
