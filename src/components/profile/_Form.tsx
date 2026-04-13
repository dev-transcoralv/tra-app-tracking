import { Text, View, TouchableOpacity } from "react-native";
import { Driver } from "../../shared.types";
import { useContext } from "react";
import { AuthContext } from "../../utils/authContext";
import Avatar from "./_Avatar";

export function ProfileForm({ driver }: { driver: Driver | null }) {
  const authContext = useContext(AuthContext);
  const ProfileRow = ({
    label,
    value,
  }: {
    label: string;
    value?: string | number;
  }) => (
    <View className="flex-row justify-between items-center py-3.5 border-b border-gray-100">
      <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest w-5/12 pt-0.5">
        {label}
      </Text>
      <Text className="text-gray-900 font-bold text-sm w-7/12 text-right">
        {value || "-"}
      </Text>
    </View>
  );

  return (
    <View className="w-full flex bg-white px-5 py-6 rounded-[32px] shadow-sm mb-4 mx-1">
      <Avatar uri={driver?.image_1920} size={110} />

      <View className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
        <ProfileRow label="Nombre" value={driver?.name} />
        <ProfileRow label="Cédula" value={driver?.vat} />
        <ProfileRow label="Dirección" value={driver?.street} />
        <ProfileRow label="Tipo Licencia" value={driver?.license_type} />
        <View className="flex-row justify-between items-center py-3.5">
          <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest w-5/12 pt-0.5">
            Vigencia Licencia
          </Text>
          <Text className="text-gray-900 font-bold text-sm w-7/12 text-right">
            {driver?.expiration_date}
          </Text>
        </View>
      </View>

      {driver && driver.port_permit.length !== 0 && (
        <View className="mb-6">
          <Text className="font-bold text-blue-600 uppercase text-[10px] tracking-widest mb-3 px-2">
            Puertos Permitidos
          </Text>
          {driver.port_permit.map((port) => (
            <View
              key={port.id}
              className="bg-white border border-gray-100 rounded-xl p-3 mb-2 shadow-sm flex-row items-center"
            >
              <View className="w-2 h-2 rounded-full bg-blue-500 mr-3" />
              <Text className="text-sm font-bold color-gray-800">
                {port.name}
              </Text>
            </View>
          ))}
        </View>
      )}

      {driver?.assigned_plate && (
        <View className="mb-6">
          <Text className="font-bold text-emerald-600 uppercase text-[10px] tracking-widest mb-3 px-2">
            Vehículo Asignado
          </Text>
          <View className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-3">
            <Text className="text-center font-extrabold text-lg color-emerald-700 tracking-widest">
              {driver.assigned_plate}
            </Text>
          </View>

          {driver.assigned_plate_port_permit.length !== 0 && (
            <View>
              <Text className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mb-3 px-2">
                Puertos de Vehículo
              </Text>
              {driver.assigned_plate_port_permit.map((port) => (
                <View
                  key={port.id}
                  className="bg-white border border-gray-100 rounded-xl p-3 mb-2 shadow-sm flex-row items-center"
                >
                  <View className="w-2 h-2 rounded-full bg-emerald-500 mr-3" />
                  <Text className="text-sm font-bold color-gray-800">
                    {port.name}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <TouchableOpacity
        className="bg-red-50 border border-red-100 rounded-2xl py-4 mt-4 items-center justify-center active:bg-red-100"
        onPress={() => authContext.logOut()}
      >
        <Text className="color-red-600 font-extrabold uppercase tracking-widest text-xs">
          Cerrar Sesión
        </Text>
      </TouchableOpacity>
    </View>
  );
}
