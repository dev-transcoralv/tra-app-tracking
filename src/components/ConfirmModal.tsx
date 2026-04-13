import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { cssInterop } from "nativewind";

const StyledView = cssInterop(View, {
  className: "style",
});

const StyledText = cssInterop(Text, {
  className: "style",
});

const StyledTouchableOpacity = cssInterop(TouchableOpacity, {
  className: "style",
});

interface ConfirmModalProps {
  visible: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <StyledView className="flex-1 bg-black/60 justify-center items-center px-4">
        <StyledView className="bg-white w-full max-w-sm rounded-[24px] p-6 shadow-lg">
          <StyledText className="text-center text-lg font-bold text-gray-800 mb-6">
            {message}
          </StyledText>

          <StyledView className="flex-col gap-3">
            <StyledTouchableOpacity
              className="bg-primary py-3.5 rounded-xl items-center"
              onPress={onConfirm}
            >
              <StyledText className="color-white font-black uppercase tracking-widest text-sm">
                Confirmar
              </StyledText>
            </StyledTouchableOpacity>

            <StyledTouchableOpacity
              className="bg-gray-100 py-3.5 rounded-xl items-center border border-gray-200"
              onPress={onCancel}
            >
              <StyledText className="text-gray-600 font-black uppercase tracking-widest text-sm">
                Cancelar
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>
      </StyledView>
    </Modal>
  );
}
