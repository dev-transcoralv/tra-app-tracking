import React, { useState } from "react";
import { View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { FontAwesomeFilter } from "./Icons";
import { cssInterop } from "nativewind";

type OptionValue = {
  label: string;
  value: string;
};

type Props = {
  options: OptionValue[];
  onSelect: (value: string) => void;
};

const StyledPicker = cssInterop(Picker, {
  className: "style",
});

export default function FilterSelection({ options, onSelect }: Props) {
  const [selected, setSelected] = useState("pending");

  const handleValueChange = (itemValue: unknown, itemIndex: number) => {
    const value = itemValue as string;
    setSelected(value);
    if (onSelect) onSelect(value);
  };

  return (
    <View className="bg-white border border-gray-100 flex-row mb-4 py-1.5 px-3 rounded-2xl shadow-sm items-center mx-1">
      <View className="flex justify-center items-center bg-blue-50 w-10 h-10 rounded-xl">
        <FontAwesomeFilter color="#3b82f6" />
      </View>
      <View className="flex-1 ml-2">
        <StyledPicker
          selectedValue={selected}
          onValueChange={handleValueChange}
          className="color-gray-800 font-bold text-lg"
          style={{
            height: 55,
            justifyContent: "center",
            backgroundColor: "transparent",
            margin: 0,
            padding: 0,
          }}
          itemStyle={{
            fontSize: 18,
            color: "#1f2937",
            fontWeight: "bold",
            height: 55,
          }}
        >
          {options.map((option) => (
            <Picker.Item
              label={option.label}
              value={option.value}
              key={option.value}
              style={{ fontSize: 16, fontWeight: "bold" }} // Reduced slightly on Android to avoid getting cut
            />
          ))}
        </StyledPicker>
      </View>
    </View>
  );
}
