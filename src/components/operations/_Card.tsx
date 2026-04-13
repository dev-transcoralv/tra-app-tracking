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
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-3 mx-1"
      href={{
        pathname: `operations/${grainOperation.id}`,
        params: { reference: grainOperation.name },
      }}
      asChild
    >
      <StyledPressable>
        <StyledText className="text-xl text-gray-900 font-extrabold tracking-tight mb-3">
          {grainOperation.name}
        </StyledText>
        <StyledView className="flex-col gap-y-2.5">
          <StyledView className="flex-row justify-between items-center">
            <StyledText className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Placa</StyledText>
            <StyledText className="text-gray-900 font-semibold text-sm">
              {grainOperation.vehicle_name}
            </StyledText>
          </StyledView>
          <StyledView className="flex-row justify-between items-center">
            <StyledText className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Operación</StyledText>
            <StyledText className="text-gray-900 font-semibold text-sm">
              {grainOperation.operation_name}
            </StyledText>
          </StyledView>
          <StyledView className="flex-row justify-between items-center">
            <StyledText className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Material</StyledText>
            <StyledText className="text-gray-900 font-semibold text-sm">
              {grainOperation.material_name}
            </StyledText>
          </StyledView>
        </StyledView>
      </StyledPressable>
    </Link>
  );
}
