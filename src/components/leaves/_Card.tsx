import { Pressable, Text, View } from "react-native";
import { useState } from "react";
import { Leave } from "../../shared.types";
import { cssInterop } from "nativewind";
import { LeaveModalForm } from "./_ModalForm";

const StyledPressable = cssInterop(Pressable, {
  className: "style",
});
const StyledView = cssInterop(View, {
  className: "style",
});
const StyledText = cssInterop(Text, {
  className: "style",
});

export function LeaveCard({ leave }: { leave: Leave }) {
  const [visible, setVisible] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);

  const openModal = (item: Leave) => {
    setSelectedLeave(item);
    setVisible(true);
  };
  const closeModal = () => {
    setSelectedLeave(null);
    setVisible(false);
  };

  return (
    <View className="bg-secondary-complementary rounded-xl p-4 shadow-md mb-4 relative">
      <StyledPressable onPress={() => openModal(leave)}>
        {/* Badges */}
        {leave.state === "confirm" && (
          <View>
            <View className="absolute top-1 right-1 bg-blue-500 px-2 py-1 rounded-full z-10">
              <Text className="color-white text-m font-bold">Por aprobar</Text>
            </View>
          </View>
        )}

        {leave.state === "validate1" && (
          <View className="absolute top-2 right-2 bg-green-300 px-2 py-1 rounded-full z-10">
            <Text className="color-white text-m font-bold">
              Segunda aprobación
            </Text>
          </View>
        )}

        {leave.state === "validate" && (
          <View className="absolute top-2 right-2 bg-green-500 px-2 py-1 rounded-full z-10">
            <Text className="color-white text-m font-bold">Aprobado</Text>
          </View>
        )}

        {leave.state === "refuse" && (
          <View className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded-full z-10">
            <Text className="color-white text-m font-bold">Rechazada</Text>
          </View>
        )}

        <StyledView className="flex-row items-center">
          <StyledText className="font-bold text-sm">Creado el:</StyledText>
          <StyledText className="ml-1 text-gray-800 font-semibold text-sm">
            {leave.create_date}
          </StyledText>
        </StyledView>
        <StyledView className="flex-row items-center">
          <StyledText className="font-bold text-sm">Tipo:</StyledText>
          <StyledText className="ml-1 text-gray-800 font-semibold text-sm">
            {leave.holiday_status.name}
          </StyledText>
        </StyledView>
        <StyledView className="flex-row items-center">
          <StyledText className="font-bold text-sm">
            Fecha Solicitada:
          </StyledText>
          <Text className="mx-1 font-bold text-sm color-blue-500">del</Text>
          <StyledText className=" text-gray-800 font-semibold text-sm">
            {leave.request_date_from}
          </StyledText>
          <Text className="mx-1 font-bold text-sm color-blue-500">al</Text>
          <StyledText className="ml-1 text-gray-800 font-semibold text-sm">
            {leave.request_date_to}
          </StyledText>
        </StyledView>
        <StyledView className="flex-row items-center">
          <StyledText className="font-bold text-sm">Descripción:</StyledText>
          <StyledText className="ml-1 text-gray-800 font-semibold text-sm">
            {leave.name}
          </StyledText>
        </StyledView>
      </StyledPressable>

      <LeaveModalForm
        visible={visible}
        leave={selectedLeave}
        onClose={closeModal}
      />
    </View>
  );
}
