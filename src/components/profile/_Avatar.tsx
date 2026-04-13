import { View, Image } from "react-native";
import { FontAwesomeUserCircle } from "../Icons";

type Props = {
  uri: string | null | undefined;
  size: number;
};
export default function Avatar({ uri, size }: Props) {
  return (
    <View className="flex items-center mb-6 mt-4">
      {uri ? (
        <View
          className="rounded-full bg-white items-center justify-center shadow-md border-4 border-white"
          style={{ width: size, height: size, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 }}
        >
          <Image
            source={{
              uri: `data:image/png;base64,${uri}`,
            }}
            className="w-full h-full rounded-full"
            resizeMode="cover"
          />
        </View>
      ) : (
        <View
          className="rounded-full bg-slate-50 items-center justify-center border-4 border-white shadow-sm"
          style={{ width: size, height: size }}
        >
          <FontAwesomeUserCircle size={size * 0.8} color="#9ca3af" />
        </View>
      )}
    </View>
  );
}
