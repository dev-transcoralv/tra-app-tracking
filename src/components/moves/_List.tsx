import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Move, Order } from "../../shared.types";
import { FontAwesomeEdit, FontAwesomeTrash } from "../Icons";
import { MoveModalForm } from "./_ModalForm";
import { deleteMove } from "../../services/odoo/move";
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
      await deleteMove(id);
      onUpdate(moves.filter((o) => o.id !== id));
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error,
      });
      throw error;
    } finally {
      setLoadingById(null);
      Toast.show({
        type: "success",
        text1: "Movimiento eliminado correctamente.",
      });
    }
  };

  return (
    <View>
      <View className="flex-row justify-between items-center mb-3 mt-1 mx-2">
        <Text className="font-extrabold text-sm uppercase tracking-widest color-blue-900">
          Movimientos
        </Text>
        {!orderFinished && (
          <TouchableOpacity
            className="justify-center px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl active:bg-blue-100"
            onPress={() => openModal(null)}
          >
            <Text className="color-blue-600 font-bold text-xs uppercase tracking-widest">+ Añadir</Text>
          </TouchableOpacity>
        )}
      </View>
      {moves &&
        moves.map((item) => (
          <View key={item.id} className="mx-2 bg-slate-50 border border-slate-100 rounded-2xl p-3 mb-2 shadow-sm">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 pr-2">
                <Text className="text-sm font-bold color-gray-900 mb-1" numberOfLines={2}>
                  {`${item.geocerca.name} ➔ ${item.geocerca_destination.name}`}
                </Text>
                <Text className="text-[10px] font-semibold color-gray-500 tracking-wider">
                  {`${item.date_in} al ${item.date_out}`}
                </Text>
              </View>
              {!orderFinished && (
                <View className="flex-row gap-x-2">
                  <TouchableOpacity
                    className="justify-center bg-white border border-gray-200 px-4 py-3 rounded-xl shadow-sm"
                    onPress={() => openModal(item)}
                  >
                    <FontAwesomeEdit color="#4b5563" size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="justify-center bg-red-50 border border-red-100 px-4 py-3 rounded-xl shadow-sm"
                    onPress={() => deleteItem(item.id)}
                  >
                    {loadingById === item.id ? (
                      <ActivityIndicator color="#ef4444" size={"small"} />
                    ) : (
                      <FontAwesomeTrash color="#ef4444" size={16} />
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
