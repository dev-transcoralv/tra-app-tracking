import React from "react";
import { TouchableOpacity, Alert, Linking } from "react-native";
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
      className="bg-green-500 py-2 px-4 rounded-xl items-center"
      onPress={openWhatsApp}
    >
      <FontAwesome name="whatsapp" size={24} color="#fff" />
    </TouchableOpacity>
  );
};

export default WhatsAppButton;
