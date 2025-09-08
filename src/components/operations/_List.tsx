import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { GrainOperationCard } from "./_Card";
import { GrainOperation } from "../../shared.types";
import { useCallback } from "react";

interface Props {
  loading: boolean;
  grainOperations: GrainOperation[];
  handleLoadMore: () => void;
}

export function ListGrainOperations({
  loading,
  grainOperations,
  handleLoadMore,
}: Props) {
  const renderItem = useCallback(({ item }: { item: GrainOperation }) => {
    return <GrainOperationCard grainOperation={item} />;
  }, []);

  return (
    <FlatList
      data={grainOperations}
      keyExtractor={(grainOperation) => String(grainOperation.id)}
      renderItem={renderItem}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      initialNumToRender={10}
      removeClippedSubviews
      windowSize={5}
      maxToRenderPerBatch={10}
      ListEmptyComponent={
        !loading ? (
          <View className="py-8 items-center">
            <Text className="text-white">No se encontraron operativos.</Text>
          </View>
        ) : null
      }
      ListFooterComponent={
        loading ? (
          <View className="my-4 items-center">
            <ActivityIndicator color={"#fff"} size={"large"} />
          </View>
        ) : null
      }
    />
  );
}
