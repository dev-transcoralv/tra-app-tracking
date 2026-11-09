import { useState } from "react";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Guide, Order } from "../../shared.types";
import { GuideModalForm } from "./_ModalForm";
import { FontAwesomeEdit, FontAwesomeTrash, FontAwesomePrint } from "../Icons";
import Toast from "react-native-toast-message";
import { confirmDelete, errorMessage } from "../../utils/confirm";
import { deleteGuide, printGuide } from "../../services/odoo/guide";

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
  const [loadingPrintById, setLoadingPrintById] = useState<number | null>(null);

  const openModal = (item: Guide | null) => {
    setSelectedGuide(item);
    setVisible(true);
  };
  const closeModal = () => {
    setVisible(false);
  };

  // QA-10: el borrado es irreversible en Odoo; se confirma antes y se
  // bloquea un segundo borrado mientras hay uno en curso.
  const deleteItem = async (item: Guide) => {
    if (loadingById !== null) return;
    const confirmed = await confirmDelete(
      "Eliminar guía",
      `¿Eliminar la guía ${item.name}? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;
    const id = item.id;
    try {
      setLoadingById(id);
      await deleteGuide(id);
      onUpdate(guides.filter((o) => o.id !== id));
      Toast.show({
        type: "success",
        text1: "Guía eliminada correctamente.",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: errorMessage(error),
      });
    } finally {
      setLoadingById(null);
    }
  };

  const printItem = async (item: Guide) => {
    try {
      setLoadingPrintById(item.id);
      const pdfBase64 = await printGuide(item.id);
      const sanitizedName = item.name.replace(/[^a-zA-Z0-9-_]/g, "_");
      const fileUri = `${FileSystem.documentDirectory}Guia_${sanitizedName}.pdf`;

      await FileSystem.writeAsStringAsync(fileUri, pdfBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/pdf",
          dialogTitle: `Descargar guía ${item.name}`,
          UTI: "com.adobe.pdf",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Compartir no está disponible en este dispositivo",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error.message || error,
      });
      throw error;
    } finally {
      setLoadingPrintById(null);
    }
  };

  return (
    <View>
      <View className="flex-row justify-between items-center mb-3 mt-1 mx-2">
        <Text className="font-extrabold text-sm uppercase tracking-widest color-blue-900">
          Guías
        </Text>
        {!orderFinished && (
          <TouchableOpacity
            className="justify-center px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl active:bg-blue-100"
            onPress={() => openModal(null)}
          >
            <Text className="color-blue-600 font-bold text-xs uppercase tracking-widest">
              + Añadir
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {guides &&
        guides.map((item) => (
          <View
            key={item.id}
            className="mx-2 bg-slate-50 border border-slate-100 rounded-2xl p-3 mb-2 shadow-sm"
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-sm">
                  {TYPES[item.type]} No. {item.name}
                </Text>
              </View>
              {item.picking_id && (
                <TouchableOpacity
                  className="justify-center bg-white border border-gray-200 px-4 py-3 rounded-xl shadow-sm"
                  onPress={() => printItem(item)}
                >
                  {loadingPrintById === item.id ? (
                    <ActivityIndicator color="#000000" size={"small"} />
                  ) : (
                    <FontAwesomePrint color="black" size={16} />
                  )}
                </TouchableOpacity>
              )}
              {!orderFinished && !item.picking_id && (
                <View className="flex-row gap-x-2">
                  <TouchableOpacity
                    className="justify-center bg-white border border-gray-200 px-4 py-3 rounded-xl shadow-sm"
                    onPress={() => openModal(item)}
                  >
                    <FontAwesomeEdit color="#4b5563" size={16} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="justify-center bg-red-50 border border-red-100 px-4 py-3 rounded-xl shadow-sm"
                    onPress={() => deleteItem(item)}
                    disabled={loadingById !== null}
                    testID={`btn-delete-${item.id}`}
                    accessibilityLabel="Eliminar"
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
