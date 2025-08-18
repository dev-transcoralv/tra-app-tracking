import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { OrderCard } from "./_Card";
import { Order } from "../../shared.types";
import { useCallback } from "react";

interface Props {
  isLoading: boolean;
  orders: Order[];
  handleLoadMore: () => void;
}

export function ListOrders({ isLoading, orders, handleLoadMore }: Props) {
  const renderItem = useCallback(({ item }: { item: Order }) => {
    return <OrderCard order={item} />;
  }, []);

  return (
    <FlatList
      data={orders}
      keyExtractor={(order) => String(order.id)}
      renderItem={renderItem}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      initialNumToRender={10}
      removeClippedSubviews
      windowSize={5}
      maxToRenderPerBatch={10}
      ListEmptyComponent={
        !isLoading ? (
          <View className="py-8 items-center">
            <Text className="text-gray-500">No se encontraron ordenes.</Text>
          </View>
        ) : null
      }
      ListFooterComponent={
        isLoading ? (
          <View className="my-4 items-center">
            <ActivityIndicator size="small" />
          </View>
        ) : null
      }
    />
  );
}
