import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Guide } from "../../shared.types";
import { FontAwesomePlus } from "../Icons";
import { GuideModalForm } from "./_ModalForm";

export function ListGuides({ guides }: { guides: Guide[] }) {
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  const openModal = (item: Guide) => setSelectedGuide(item);
  const closeModal = () => setSelectedGuide(null);

  const renderItem = ({ item }: { item: Guide }) => {
    return (
      <View className="bg-gray-700 rounded-xl p-2 mb-2">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-bold color-white">{item.name}</Text>
          <TouchableOpacity
            className="justify-center bg-primary px-4 py-3 rounded-lg"
            onPress={() => openModal(item)}
          >
            <FontAwesomePlus color="white" size={16} />
          </TouchableOpacity>
        </View>

        {selectedGuide && (
          <GuideModalForm guide={selectedGuide} onClose={closeModal} />
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={guides}
      keyExtractor={(guide: Guide) => guide.id.toString()}
      renderItem={renderItem}
      ListHeaderComponent={
        <Text className="font-extrabold text-lg color-primary underline mb-2">
          Guías:
        </Text>
      }
    />
  );
}
