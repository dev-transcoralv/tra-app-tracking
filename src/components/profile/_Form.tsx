import { Text, View, TextInput } from "react-native";
import { Driver } from "../../shared.types";

export function ProfileForm({ driver }: { driver: Driver }) {
  return (
    <View className="">
      <Text className="font-bold">Nombre:</Text>
      <TextInput
        readOnly
        value={driver.name}
        className="color-secondary flex-1 bg-transparent border-0 w-full outline-none text-sm md:text-base"
      />
    </View>
  );
}
