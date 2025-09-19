import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Guide, Order } from "../../shared.types";
import { GuideModalForm } from "./_ModalForm";
import { FontAwesomeEdit, FontAwesomeTrash } from "../Icons";
import Toast from "react-native-toast-message";
import { deleteGuide } from "../../services/odoo/guide";

interface Props {
  order: Order;
  guides: Guide[];
  onUpdate: (newGuides: Guide[]) => void;
  orderFinished: boolean;
}

const TYPES: Record<string, string> = {
  own: "Propia",
  third: "Cliente",
};

export function ListGuides({ order, guides, onUpdate, orderFinished }: Props) {
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [visible, setVisible] = useState(false);
  const [loadingById, setLoadingById] = useState<number | null>(null);

  const openModal = (item: Guide | null) => {
    setSelectedGuide(item);
    setVisible(true);
  };
  const closeModal = () => {
    setVisible(false);
  };

  const deleteItem = async (id: number) => {
    try {
      setLoadingById(id);
      await deleteGuide(id);
      onUpdate(guides.filter((o) => o.id !== id));
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error,
      });
      throw error;
    } finally {
      setLoadingById(null);
    }
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
            <Text className="text-sm font-bold">
              {TYPES[item.type]} No. {item.name}
            </Text>
            {!orderFinished && (
              <View className="flex-row gap-x-2">
                <TouchableOpacity
                  className="justify-center bg-secondary px-5 py-4 rounded-lg"
                  onPress={() => openModal(item)}
                >
                  <FontAwesomeEdit color="white" size={16} />
                </TouchableOpacity>
                <TouchableOpacity
                  className="justify-center bg-primary px-5 py-4 rounded-lg"
                  onPress={() => deleteItem(item.id)}
                >
                  {loadingById === item.id ? (
                    <ActivityIndicator color="#fff" size={"small"} />
                  ) : (
                    <FontAwesomeTrash color="white" size={16} />
                  )}
                </TouchableOpacity>
              </View>
            )}
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
