import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { Leave } from "../../shared.types";
import { useCallback } from "react";
import { LeaveCard } from "./_Card";

interface Props {
  loading: boolean;
  leaves: Leave[];
  handleLoadMore: () => void;
}

export function ListLeaves({ loading, leaves, handleLoadMore }: Props) {
  const renderItem = useCallback(({ item }: { item: Leave }) => {
    return <LeaveCard leave={item} />;
  }, []);

  return (
    <FlatList
      data={leaves}
      keyExtractor={(leave, index) => `${leave.id}-${index}`}
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
            <Text className="color-white">No se encontraron ausencias.</Text>
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
