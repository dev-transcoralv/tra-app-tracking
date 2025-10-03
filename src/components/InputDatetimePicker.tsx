import { useState } from "react";
import { View, Text, Platform, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Controller } from "react-hook-form";
import { format } from "date-fns";

export function InputDatetimePicker({ control, name, label, disabled }: any) {
  const [show, setShow] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: true }}
      render={({ field: { value, onChange } }) => (
        <View className="w-full">
          <TouchableOpacity
            onPress={() => setShow(true)}
            className="bg-blue-900 px-5 py-3 items-center"
            disabled={disabled}
          >
            <Text className="color-white font-semibold">
              {value
                ? `📅 ${format(value, "dd/MM/yyyy HH:mm:ss")}`
                : `Seleccionar ${label}`}
            </Text>
          </TouchableOpacity>

          {show && (
            <DateTimePicker
              value={value ?? new Date()}
              mode="time"
              is24Hour
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShow(Platform.OS === "ios");
                if (selectedDate) {
                  onChange(selectedDate);
                }
              }}
            />
          )}
        </View>
      )}
    />
  );
}
