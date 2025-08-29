import { View, Image } from "react-native";
import { FontAwesomeUserCircle } from "../Icons";

type Props = {
  uri: string | null | undefined;
  size: number;
};
export default function Avatar({ uri, size }: Props) {
  return (
    <View className="flex items-center">
      {uri ? (
        <View
          className="rounded-full bg-gray-200 items-center justify-center overflow-hidden"
          style={{ width: size, height: size }}
        >
          <Image
            source={{
              uri: `data:image/png;base64,${uri}`,
            }}
            className="w-16 h-16 rounded-full"
          />
        </View>
      ) : (
        <FontAwesomeUserCircle size={size} />
      )}
    </View>
  );
}
