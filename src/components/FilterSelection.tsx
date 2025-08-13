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
    <View className="bg-gray-200 flex-row mb-2 py-2 px-2 rounded-xl">
      <View className="flex w-1/12 justify-center items-center">
        <FontAwesomeFilter color="#1c3b8a" />
      </View>
      <View className="flex w-11/12">
        <StyledPicker
          selectedValue={selected}
          onValueChange={handleValueChange}
          className="bg-blue-900 text-white"
        >
          {options.map((option) => (
            <Picker.Item
              label={option.label}
              value={option.value}
              key={option.value}
            />
          ))}
        </StyledPicker>
      </View>
    </View>
  );
}
