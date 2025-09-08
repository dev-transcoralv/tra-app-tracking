import { Pressable, Text } from "react-native";
import { GrainOperation } from "../../shared.types";
import { Link } from "expo-router";
import { cssInterop } from "nativewind";

const StyledPressable = cssInterop(Pressable, {
  className: "style",
});
const StyledText = cssInterop(Text, {
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
      </StyledPressable>
    </Link>
  );
}
