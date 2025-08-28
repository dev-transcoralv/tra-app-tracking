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
      <StyledView className="flex-1 bg-black/75 justify-center items-center">
        <StyledView className="bg-white w-11/12 max-w-md rounded-xl p-6">
          <StyledText className="text-center text-lg mb-5">
            {message}
          </StyledText>

          <StyledView className="flex-row justify-center gap-2">
            <StyledTouchableOpacity
              className="bg-secondary px-4 py-2"
              onPress={onCancel}
            >
              <StyledText className="text-white font-bold">Cancelar</StyledText>
            </StyledTouchableOpacity>

            <StyledTouchableOpacity
              className="bg-primary px-4 py-2"
              onPress={onConfirm}
            >
              <StyledText className="text-white font-bold">
                Confirmar
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>
      </StyledView>
    </Modal>
  );
}
