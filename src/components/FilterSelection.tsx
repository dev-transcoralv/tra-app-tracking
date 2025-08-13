import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

type OptionValue = {
  label: string;
  value: string;
};

type Props = {
  options: OptionValue[];
  onSelect: (value: string) => void;
};

export default function FilterSelection({ options, onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  function handleSelect(value: string) {
    setSelected(value);
    if (onSelect) onSelect(value);
  }

  return (
    <View className="flex-row justify-around my-3">
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          className={`px-5 py-3 items-center rounded-sm ${selected === option.value ? "bg-primary" : "bg-white"}`}
          onPress={() => handleSelect(option.value)}
        >
          <Text
            className={`${selected === option.value ? "color-white font-extrabold" : ""}`}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
