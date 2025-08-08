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
      <View className="bg-white rounded-xl p-2 mb-2">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
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
