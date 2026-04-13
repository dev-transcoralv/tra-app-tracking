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
    <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-3 mx-1 mt-1 relative">
      <StyledPressable onPress={() => openModal(leave)}>
        {/* Badges */}
        {leave.state === "confirm" && (
          <View className="self-end mb-2">
            <View className="bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
              <Text className="color-blue-700 text-[10px] uppercase font-extrabold tracking-widest">Por aprobar</Text>
            </View>
          </View>
        )}

        {leave.state === "validate1" && (
          <View className="self-end mb-2">
            <View className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
              <Text className="color-emerald-700 text-[10px] uppercase font-extrabold tracking-widest">Segunda aprobación</Text>
            </View>
          </View>
        )}

        {leave.state === "validate" && (
          <View className="self-end mb-2">
            <View className="bg-green-50 border border-green-100 px-3 py-1.5 rounded-full flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
              <Text className="color-green-700 text-[10px] uppercase font-extrabold tracking-widest">Aprobado</Text>
            </View>
          </View>
        )}

        {leave.state === "refuse" && (
          <View className="self-end mb-2">
            <View className="bg-red-50 border border-red-100 px-3 py-1.5 rounded-full flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" />
              <Text className="color-red-700 text-[10px] uppercase font-extrabold tracking-widest">Rechazada</Text>
            </View>
          </View>
        )}

        <StyledView className="flex-col gap-y-3 mt-1 pt-3 border-t border-gray-50">
          <StyledView className="flex-row justify-between items-center">
            <StyledText className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Creado el</StyledText>
            <StyledText className="text-gray-900 font-bold text-sm">
              {leave.create_date}
            </StyledText>
          </StyledView>
          <StyledView className="flex-row justify-between items-center">
            <StyledText className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Tipo</StyledText>
            <StyledText className="text-gray-900 font-bold text-sm">
              {leave.holiday_status.name}
            </StyledText>
          </StyledView>
          <StyledView className="flex-row justify-between items-center">
            <StyledText className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">
              Fechas
            </StyledText>
            <StyledView className="flex-row items-center">
              <StyledText className=" text-gray-900 font-semibold text-sm">
                {leave.request_date_from}
              </StyledText>
              <Text className="mx-1.5 font-bold text-xs color-gray-400">→</Text>
              <StyledText className=" text-gray-900 font-semibold text-sm">
                {leave.request_date_to}
              </StyledText>
            </StyledView>
          </StyledView>
          <StyledView className="flex-row justify-between items-start mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <StyledText className="text-gray-700 font-medium text-sm leading-tight text-center w-full">
              {leave.name}
            </StyledText>
          </StyledView>
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
