import { useState } from "react";
import { View, Text, Platform, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Controller } from "react-hook-form";
import { format } from "date-fns";

export function InputDatePicker({ control, name, label, disabled }: any) {
  const [show, setShow] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: true }}
      render={({ field: { value, onChange } }) => (
        <View className="w-full my-1">
          <TouchableOpacity
            onPress={() => setShow(true)}
            className="bg-white border border-gray-200 shadow-sm rounded-2xl px-5 py-4 flex-row justify-center items-center active:bg-gray-50"
            disabled={disabled}
          >
            <Text className="text-gray-700 font-bold text-sm uppercase tracking-widest">
              {value
                ? `📅 ${format(value, "dd/MM/yyyy")}`
                : `Seleccionar ${label}`}
            </Text>
          </TouchableOpacity>

          {show && (
            <DateTimePicker
              value={value ?? new Date()}
              mode="date"
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
