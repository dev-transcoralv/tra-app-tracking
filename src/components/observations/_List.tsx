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
    }
  };

  return (
    <View>
      <View className="flex-row justify-between mb-2">
        <Text className="font-extrabold text-lg color-primary underline align-middle">
          Observaciones:
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
      {observations.map((item) => (
        <View key={item.id} className="bg-white border rounded-xl p-2 mb-2">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold">{item.name}</Text>
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
