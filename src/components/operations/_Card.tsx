import { Pressable, Text, View } from "react-native";
import { GrainOperation } from "../../shared.types";
import { Link } from "expo-router";
import { cssInterop } from "nativewind";

const StyledPressable = cssInterop(Pressable, {
  className: "style",
});
const StyledText = cssInterop(Text, {
  className: "style",
});
const StyledView = cssInterop(View, {
  className: "style",
});

export function GrainOperationCard({
  grainOperation,
}: {
  grainOperation: GrainOperation;
}) {
  return (
    <Link
      className="bg-secondary-complementary rounded-xl p-4 shadow-md mb-4 relative"
      href={{
        pathname: `operations/${grainOperation.id}`,
        params: { reference: grainOperation.name },
      }}
      asChild
    >
      <StyledPressable>
        <StyledText className="text-l text-primary font-bold">
          {grainOperation.name}
        </StyledText>
        <StyledView className="flex-row">
          <StyledText className="font-bold text-sm">Placa:</StyledText>
          <StyledText className="ml-1 text-gray-800 font-semibold text-sm">
            {grainOperation.vehicle_name}
          </StyledText>
        </StyledView>
        <StyledView className="flex-row">
          <StyledText className="font-bold text-sm">Operación:</StyledText>
          <StyledText className="ml-1 text-gray-800 font-semibold text-sm">
            {grainOperation.operation_name}
          </StyledText>
        </StyledView>
        <StyledView className="flex-row">
          <StyledText className="font-bold text-sm">Material:</StyledText>
          <StyledText className="ml-1 text-gray-800 font-semibold text-sm">
            {grainOperation.material_name}
          </StyledText>
        </StyledView>
      </StyledPressable>
    </Link>
  );
}
