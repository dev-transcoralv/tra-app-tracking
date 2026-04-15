import React from "react";
import { TouchableOpacity, Alert, Linking, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons"; // WhatsApp icon

type WhatsAppButtonProps = {
  phone: string;
  message: string;
};

const WhatsAppButton = ({ phone, message }: WhatsAppButtonProps) => {
  const openWhatsApp = async () => {
    const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "WhatsApp is not installed");
      }
    } catch (error: any) {
      Alert.alert("Error", error);
    }
  };

  return (
    <TouchableOpacity
      className="bg-emerald-500 py-3.5 px-5 rounded-2xl items-center shadow-sm active:opacity-80 flex-row justify-center gap-2 m-1"
      onPress={openWhatsApp}
    >
      <FontAwesome name="whatsapp" size={20} color="#fff" />
      <Text className="text-white font-bold tracking-widest text-sm uppercase">
        Contactar
      </Text>
    </TouchableOpacity>
  );
};

export default WhatsAppButton;
