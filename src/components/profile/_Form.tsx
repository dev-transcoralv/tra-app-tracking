import { Text, View, TextInput } from "react-native";
import { Driver } from "../../shared.types";

export function ProfileForm({ driver }: { driver: Driver | null }) {
  return (
    <View className="w-full flex gap-1 bg-secondary-complementary p-2 rounded-xl">
      <Text className="font-bold">Nombre:</Text>
      <TextInput readOnly value={driver?.name} />
    </View>
  );
}
