import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Guide, Order } from "../../shared.types";
import { FontAwesomeEdit } from "../Icons";
import { GuideModalForm } from "./_ModalForm";

interface Props {
  order: Order;
  guides: Guide[];
  onUpdate: (newGuides: Guide[]) => void;
  orderFinished: boolean;
}

export function ListGuides({ order, guides, onUpdate, orderFinished }: Props) {
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [visible, setVisible] = useState(false);

  const openModal = (item: Guide | null) => {
    setSelectedGuide(item);
    setVisible(true);
  };
  const closeModal = () => {
    setSelectedGuide(null);
    setVisible(false);
  };

  return (
    <View>
      <View className="flex-row justify-between mb-2">
        <Text className="font-extrabold text-lg color-primary underline align-middle">
          Guías:
        </Text>
        {!orderFinished && (
          <TouchableOpacity
            className="justify-center px-4 py-3 bg-secondary rounded-lg"
            onPress={() => openModal(null)}
          >
            <Text className="color-white font">Añadir</Text>
          </TouchableOpacity>
        )}
      </View>
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
        </View>
      ))}

      <GuideModalForm
        visible={visible}
        guide={selectedGuide}
        order={order}
        onClose={closeModal}
        onSave={(updatedGuide) => {
          const observation = guides.find((o) => o.id === updatedGuide.id);
          if (observation) {
            onUpdate(
              guides.map((o) => (o.id === updatedGuide.id ? updatedGuide : o)),
            );
          } else {
            onUpdate([...guides, updatedGuide]);
          }
        }}
      />
    </View>
  );
}
