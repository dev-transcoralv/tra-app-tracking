import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Guide } from "../../shared.types";
import { FontAwesomeEdit } from "../Icons";
import { GuideModalForm } from "./_ModalForm";

export function ListGuides({ guides }: { guides: Guide[] }) {
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  const openModal = (item: Guide) => setSelectedGuide(item);
  const closeModal = () => setSelectedGuide(null);

  return (
    <View>
      <Text className="font-extrabold text-lg color-primary underline mb-2">
        Guías:
      </Text>
      {guides.map((item) => (
        <View key={item.id} className="bg-white border rounded-xl p-2 mb-2">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold">{item.name}</Text>
            <TouchableOpacity
              className="justify-center bg-secondary px-5 py-4 rounded-lg"
              onPress={() => openModal(item)}
            >
              <FontAwesomeEdit color="white" size={16} />
            </TouchableOpacity>
          </View>

          {selectedGuide && (
            <GuideModalForm guide={selectedGuide} onClose={closeModal} />
          )}
        </View>
      ))}
    </View>
  );
}
