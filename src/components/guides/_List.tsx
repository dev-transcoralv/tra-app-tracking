import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Guide } from "../../shared.types";
import { FontAwesomeCamera } from "../Icons";

export function ListGuides({ guides }: { guides: Guide[] }) {
  const takePhoto = () => {};

  const renderItem = ({ item }: { item: Guide }) => {
    return (
      <View className="bg-white rounded-xl p-2 mb-2">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
          <TouchableOpacity
            className="flex-row items-center justify-center bg-indigo-600 px-4 py-3 rounded-lg"
            onPress={takePhoto}
          >
            <FontAwesomeCamera props={{ color: "white" }} />
            <Text className="text-white ml-2 font-semibold">Tomar Foto</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View>
      <Text className="font-bold mb-2">Guías:</Text>
      <FlatList
        data={guides}
        keyExtractor={(guide: Guide) => guide.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}
