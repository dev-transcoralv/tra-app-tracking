import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Move, Order } from "../../shared.types";
import { FontAwesomeEdit, FontAwesomeTrash } from "../Icons";
import { MoveModalForm } from "./_ModalForm";
import { deleteObservation } from "../../services/odoo/observation";
import Toast from "react-native-toast-message";

interface Props {
  order: Order;
  moves: Move[];
  onUpdate: (newMoves: Move[]) => void;
  orderFinished: boolean;
}

export function ListMoves({ order, moves, onUpdate, orderFinished }: Props) {
  const [selectedMove, setSelectedObservation] = useState<Move | null>(null);
  const [visible, setVisible] = useState(false);

  const openModal = (item: Move | null) => {
    setSelectedObservation(item);
    setVisible(true);
  };
  const closeModal = () => setVisible(false);
  const [loadingById, setLoadingById] = useState<number | null>(null);

  const deleteItem = async (id: number) => {
    try {
      setLoadingById(id);
      await deleteObservation(id);
      onUpdate(moves.filter((o) => o.id !== id));
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
          Movimientos:
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
      {moves.map((item) => (
        <View key={item.id} className="bg-white border rounded-xl p-1 mb-2">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-bold text">Hola</Text>
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

      <MoveModalForm
        visible={visible}
        move={selectedMove}
        order={order}
        onClose={closeModal}
        onSave={(updatedMove) => {
          const observation = moves.find((o) => o.id === updatedMove.id);
          if (observation) {
            onUpdate(
              moves.map((o) => (o.id === updatedMove.id ? updatedMove : o)),
            );
          } else {
            onUpdate([...moves, updatedMove]);
          }
        }}
      />
    </View>
  );
}
