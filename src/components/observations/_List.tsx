import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Observation, Order } from "../../shared.types";
import { FontAwesomeEdit, FontAwesomeTrash } from "../Icons";
import { ObservationModalForm } from "./_ModalForm";
import { deleteObservation } from "../../services/odoo/observation";
import Toast from "react-native-toast-message";

interface Props {
  order: Order;
  observations: Observation[];
  onUpdate: (newObservations: Observation[]) => void;
  orderFinished: boolean;
}

export function ListObservations({
  order,
  observations,
  onUpdate,
  orderFinished,
}: Props) {
  const [selectedObservation, setSelectedObservation] =
    useState<Observation | null>(null);
  const [visible, setVisible] = useState(false);

  const openModal = (item: Observation | null) => {
    setSelectedObservation(item);
    setVisible(true);
  };
  const closeModal = () => setVisible(false);
  const [loadingById, setLoadingById] = useState<number | null>(null);

  const deleteItem = async (id: number) => {
    try {
      setLoadingById(id);
      await deleteObservation(id);
      onUpdate(observations.filter((o) => o.id !== id));
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
        text1: "Observación eliminada correctamente.",
      });
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  return (
    <View>
      <View className="flex-row justify-between items-center mb-3 mt-1 mx-2">
        <Text className="font-extrabold text-sm uppercase tracking-widest color-blue-900">
          Observaciones
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
      {observations.map((item) => (
        <View key={item.id} className="mx-2 bg-slate-50 border border-slate-100 rounded-2xl p-3 mb-2 shadow-sm">
          <View className="flex-row justify-between items-center">
            <View className="flex-1 pr-2">
              <Text className="text-sm font-semibold color-gray-900">
                {truncateText(item.name, 45)}
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

      <ObservationModalForm
        visible={visible}
        observation={selectedObservation}
        order={order}
        onClose={closeModal}
        onSave={(updatedObservation) => {
          const observation = observations.find(
            (o) => o.id === updatedObservation.id,
          );
          if (observation) {
            onUpdate(
              observations.map((o) =>
                o.id === updatedObservation.id ? updatedObservation : o,
              ),
            );
          } else {
            onUpdate([...observations, updatedObservation]);
          }
        }}
      />
    </View>
  );
}
